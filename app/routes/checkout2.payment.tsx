import {
  MetaFunction,
  useLoaderData,
  useActionData,
  useNavigate,
  useFetcher,
  useSearchParams,
  useOutletContext,
} from '@remix-run/react';
import { useState, useEffect, useMemo } from 'react';
import {
  DataFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/server-runtime';
import { APP_META_TITLE } from '~/constants';
import {
  AlertCircleIcon,
  LockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from 'lucide-react';
import {
  addPaymentToOrder,
  transitionOrderToState,
  getNextOrderStates,
  getActiveOrder,
} from '~/providers/orders/order';
import { getActiveCustomer } from '~/providers/customer/customer';
import {
  generateRazorpayOrderId,
  getEligiblePaymentMethods,
} from '~/providers/checkout/checkout';
import { formatPrice } from '~/providers/cart/vendureCart';
import { sdk } from '~/graphqlWrapper';
import { RazorpayPayments } from '~/components/checkout/razorpay/RazorpayPayments';

export const meta: MetaFunction = () => {
  return [
    {
      title: `Payment - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: 'Complete your payment securely',
    },
  ];
};

function getPaymentConfig() {
  return {
    easebuzzEnabled:
      Boolean(process.env.EASEBUZZ_KEY) && Boolean(process.env.EASEBUZZ_SALT),
    razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID),
    stripeEnabled: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    braintreeEnabled: Boolean(process.env.BRAINTREE_CLIENT_TOKEN),
  };
}

function isMethodEnabledByConfig(
  methodCode: string,
  cfg: ReturnType<typeof getPaymentConfig>,
) {
  const code = methodCode.toLowerCase();
  if (code.includes('easebuzz')) return cfg.easebuzzEnabled;
  if (code.includes('razorpay')) return cfg.razorpayEnabled;
  if (code.includes('stripe')) return cfg.stripeEnabled;
  if (code.includes('braintree')) return cfg.braintreeEnabled;
  // Keep other methods enabled by default (e.g. HDFC custom gateway)
  return true;
}

export async function loader({ request }: DataFunctionArgs) {
  try {
    const url = new URL(request.url);
    const orderCode = url.searchParams.get('orderCode');
    const paymentMethod = url.searchParams.get('method');

    // Validate orderCode
    if (!orderCode || orderCode === 'undefined' || orderCode === 'null') {
      console.log('No valid orderCode provided, redirecting to checkout2');
      return redirect('/checkout2');
    }

    // Get customer info
    const activeCustomer = await getActiveCustomer({ request });
    console.log(
      'Payment loader - activeCustomer:',
      activeCustomer?.activeCustomer?.id,
    );

    // Get active order only
    const order = await getActiveOrder({ request });
    console.log('Using active order for payment');
    console.log(
      'Payment loader - final order:',
      order
        ? {
            code: order.code,
            state: order.state,
            totalWithTax: order.totalWithTax,
            subTotal: order.subTotal,
            subTotalWithTax: order.subTotalWithTax,
            lines: order.lines?.length || 0,
            active: order.active,
          }
        : 'Order is null',
    );

    if (!order) {
      console.log('Order not found, redirecting to checkout2');
      return redirect('/checkout2');
    }

    // Order must be active and have items
    if (!order.active || order.lines.length === 0) {
      console.log(
        'Order is not active or has no items, redirecting to checkout2',
      );
      return redirect('/checkout2');
    }

    // Check if order is in the correct state for payment
    const validPaymentStates = ['ArrangingPayment', 'PaymentAuthorized'];
    if (!validPaymentStates.includes(order.state)) {
      console.log(
        'Order is not in a valid payment state, current state:',
        order.state,
      );
      return redirect('/checkout2');
    }

    console.log('Order is in valid payment state:', order.state);

    // Razorpay: generate an order id for the frontend popup.
    // Browser needs only `RAZORPAY_KEY_ID`; signature verification happens on backend.
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
    let razorpayOrderId: string | null = null;
    if (razorpayKeyId && order?.id) {
      try {
        const razorpayOrderIdResult = await generateRazorpayOrderId(order.id, {
          request,
        });
        const generated = razorpayOrderIdResult?.generateRazorpayOrderId;
        if (generated?.__typename === 'RazorpayOrderIdSuccess') {
          razorpayOrderId = generated.razorpayOrderId;
        } else {
          console.error('Razorpay order id generation failed:', generated);
        }
      } catch (e) {
        console.error('Error generating Razorpay order id:', e);
      }
    }

    // Fetch eligible payment methods
    const { eligiblePaymentMethods } = await getEligiblePaymentMethods({
      request,
    });
    console.log(
      'Eligible Payment Methods from server:',
      eligiblePaymentMethods,
    );

    const paymentConfig = getPaymentConfig();
    const configuredEligiblePaymentMethods = (
      eligiblePaymentMethods || []
    ).filter((m: any) => isMethodEnabledByConfig(m.code, paymentConfig));

    return json({
      order,
      orderCode,
      paymentMethod: paymentMethod || 'online',
      customer: activeCustomer?.activeCustomer || null,
      eligiblePaymentMethods: configuredEligiblePaymentMethods,
      paymentConfig,
      razorpayKeyId,
      razorpayOrderId,
    });
  } catch (error) {
    console.error('Payment loader error:', error);
    return redirect('/checkout2');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('=== PAYMENT ACTION TRIGGERED ===');

  try {
    const formData = await request.formData();
    const formAction = formData.get('action') as string;

    console.log('Form action:', formAction);

    switch (formAction) {
      case 'addPaymentToOrder': {
        const paymentMethodCode = formData.get('paymentMethodCode') as string;
        const orderCode = formData.get('orderCode') as string;
        const paymentNonce = formData.get('paymentNonce') as string;
        const amount = formData.get('amount')?.toString();
        // const description = formData.get('description')?.toString();
        // const name = formData.get('name')?.toString();
        // const email = formData.get('email')?.toString();

        console.log('Payment data:', {
          paymentMethodCode,
          orderCode,
          amount,
          paymentNonce,
        });

        if (!paymentMethodCode) {
          return json(
            {
              error: 'No payment method provided',
            },
            { status: 400 },
          );
        }

        // Razorpay flow:
        // We should NOT call `addPaymentToOrder` with an incomplete metadata payload.
        // Instead, after the Razorpay popup succeeds we receive:
        // `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`,
        // and we settle the payment in Vendure.
        if (paymentMethodCode === 'razorpay') {
          if (!orderCode) {
            return redirect(
              `/checkout2/confirmation/unknown?status=failure&error=${encodeURIComponent(
                'Missing orderCode for Razorpay payment',
              )}`,
            );
          }

          if (!paymentNonce) {
            return redirect(
              `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
                'Missing Razorpay payment data',
              )}`,
            );
          }

          try {
            const parsedNonce = JSON.parse(paymentNonce);
            const razorpay_order_id =
              parsedNonce?.razorpay_order_id || parsedNonce?.order_id;
            const razorpay_payment_id =
              parsedNonce?.razorpay_payment_id || parsedNonce?.payment_id;
            const razorpay_signature =
              parsedNonce?.razorpay_signature || parsedNonce?.signature;

            if (
              !razorpay_order_id ||
              !razorpay_payment_id ||
              !razorpay_signature
            ) {
              return redirect(
                `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
                  'Incomplete Razorpay payment response',
                )}`,
              );
            }

            const settleResult = await sdk.settleRazorpayPayment(
              {
                orderCode,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              { request },
            );

            const settled = settleResult?.settleRazorpayPayment as any;
            if (settled?.__typename === 'SettleRazorpayPaymentError') {
              return redirect(
                `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
                  settled.message || 'The payment failed',
                )}`,
              );
            }

            return redirect(
              `/checkout2/confirmation/${orderCode}?status=success`,
            );
          } catch (e) {
            console.error('Error settling Razorpay payment:', e);
            return redirect(
              `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
                'Failed to settle Razorpay payment',
              )}`,
            );
          }
        }

        try {
          // Get current active order only
          const currentOrder = await getActiveOrder({ request });
          console.log('Using active order for payment');

          if (!currentOrder) {
            return json(
              {
                error: 'Order not found',
              },
              { status: 404 },
            );
          }

          console.log('Current order state before payment:', {
            code: currentOrder.code,
            state: currentOrder.state,
            totalWithTax: currentOrder.totalWithTax,
            subTotal: currentOrder.subTotal,
            subTotalWithTax: currentOrder.subTotalWithTax,
            lines: currentOrder.lines?.length || 0,
            active: currentOrder.active,
          });

          // Validate order state
          const validPaymentStates = ['ArrangingPayment', 'PaymentAuthorized'];
          if (!validPaymentStates.includes(currentOrder.state)) {
            console.error(
              'Order is not in a valid payment state:',
              currentOrder.state,
            );
            return json(
              {
                error:
                  'Order is not ready for payment. Please complete checkout first.',
              },
              { status: 400 },
            );
          }

          // Parse payment data
          let metadata = {};
          if (paymentNonce) {
            try {
              const parsedNonce = JSON.parse(paymentNonce);
              console.log(
                'Parsed payment data for',
                paymentMethodCode,
                ':',
                parsedNonce,
              );
              metadata = {
                ...parsedNonce,
                orderCode,
              };
            } catch (e) {
              console.error('Error parsing payment data:', e);
              return json(
                {
                  error: 'Invalid payment data format',
                },
                { status: 400 },
              );
            }
          }

          console.log('Sending payment to order with metadata:', metadata);

          // Process payment
          const result = await addPaymentToOrder(
            {
              method: paymentMethodCode,
              metadata,
            },
            { request },
          );

          console.log('Payment result:', JSON.stringify(result));

          if (result.addPaymentToOrder.__typename === 'Order') {
            // Handle different payment methods that require redirect
            const paymentData = result.addPaymentToOrder?.payments?.find(
              (item) =>
                item.method === paymentMethodCode &&
                item.state === 'Authorized',
            );
            console.log(
              'Payment data for',
              paymentMethodCode,
              ':',
              paymentData,
            );

            if (paymentMethodCode === 'easebuzz') {
              const easebuzzPaymentUrl =
                paymentData?.customFields?.paymentPageUrl;
              console.log('Easebuzz payment URL:', easebuzzPaymentUrl);

              if (!easebuzzPaymentUrl) {
                console.error('No Easebuzz payment URL found in payment data');
                return json(
                  {
                    error:
                      'Failed to generate easebuzz payment. Please try again.',
                  },
                  { status: 400 },
                );
              }

              return json({
                success: true,
                paymentMethod: 'easebuzz',
                orderCode: result.addPaymentToOrder.code,
                paymentUrl: easebuzzPaymentUrl,
              });
            } else if (paymentMethodCode === 'hdfc') {
              const hdfcPaymentUrl = paymentData?.customFields?.paymentPageUrl;
              console.log('HDFC payment data:', paymentData);
              console.log('HDFC payment URL:', hdfcPaymentUrl);

              if (!hdfcPaymentUrl) {
                console.error('No HDFC payment URL found in payment data');
                return json(
                  {
                    error:
                      'Failed to generate HDFC payment session. Please try again.',
                  },
                  { status: 400 },
                );
              }

              console.log('HDFC payment session created successfully');
              return json({
                success: true,
                paymentMethod: 'hdfc',
                paymentUrl: hdfcPaymentUrl,
                orderCode: result.addPaymentToOrder.code,
              });
            } else if (paymentMethodCode === 'razorpay') {
              return json({
                success: true,
                paymentMethod: 'razorpay',
                orderCode: result.addPaymentToOrder.code,
              });
            }

            // For other payment methods or direct success
            return redirect(
              `/checkout2/confirmation/${result.addPaymentToOrder.code}?status=success`,
            );
          } else {
            console.error('Payment failed:', result.addPaymentToOrder);
            // Vendure's PaymentFailedError exposes a more specific `paymentErrorMessage`.
            // Showing that helps us debug gateway issues (missing/invalid credentials, invalid signature, etc).
            const failed = result.addPaymentToOrder as any;
            const errorCode =
              failed?.__typename === 'PaymentFailedError'
                ? failed?.errorCode
                : undefined;
            const paymentErrorMessage =
              failed?.__typename === 'PaymentFailedError'
                ? failed?.paymentErrorMessage
                : undefined;

            const errorMessage =
              paymentErrorMessage ||
              failed?.message ||
              (errorCode ? `Payment failed (${errorCode})` : 'Unknown error');

            // Attempt to roll back order state
            try {
              const nextStates = await getNextOrderStates({ request });
              if (nextStates.includes('AddingItems')) {
                await transitionOrderToState('AddingItems', { request });
                console.log(
                  'Rolled back order state to AddingItems after payment failure',
                );
              }
            } catch (rollbackErr) {
              console.error(
                'Failed to rollback order state after payment failure:',
                rollbackErr,
              );
            }
            return redirect(
              `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
                errorMessage,
              )}`,
            );
          }
        } catch (error) {
          console.error('Error in payment processing:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred';

          // Attempt to roll back order state
          try {
            const nextStates = await getNextOrderStates({ request });
            if (nextStates.includes('AddingItems')) {
              await transitionOrderToState('AddingItems', { request });
              console.log(
                'Rolled back order state to AddingItems after exception during payment',
              );
            }
          } catch (rollbackErr) {
            console.error(
              'Failed to rollback order state after exception:',
              rollbackErr,
            );
          }
          return redirect(
            `/checkout2/confirmation/${orderCode}?status=failure&error=${encodeURIComponent(
              errorMessage,
            )}`,
          );
        }
      }
      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in action function:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return redirect(
      `/checkout2/confirmation/unknown?status=failure&error=${encodeURIComponent(
        errorMessage,
      )}`,
    );
  }
}

export default function Checkout2Payment() {
  const {
    order,
    orderCode,
    paymentMethod,
    customer,
    eligiblePaymentMethods,
    paymentConfig,
    razorpayKeyId,
    razorpayOrderId,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  const [searchParams] = useSearchParams();

  // Get form data from Outlet context
  const { formData } = useOutletContext<{
    formData: any;
    setFormData: (data: any) => void;
    orderCode: string | null;
    setOrderCode: (code: string | null) => void;
  }>();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => {
    if (paymentMethod && paymentMethod !== 'online') {
      return paymentMethod;
    }
    const firstMethod = eligiblePaymentMethods?.find(
      (method) => method.isEligible,
    );
    return firstMethod?.code || 'easebuzz';
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate discount breakdown
  const offerAmountDetail: {
    totalDiscount: number;
    additionalOfferAmount: number;
    couponOfferAmount: number;
  } = useMemo(() => {
    const discounts = order?.discounts;
    const promotions = order?.promotions;
    if (!discounts || discounts.length === 0) {
      return {
        totalDiscount: 0,
        additionalOfferAmount: 0,
        couponOfferAmount: 0,
      };
    }
    let additionalOfferAmount = 0;
    let couponOfferAmount = 0;
    // Sum all discounts (amounts may be negative, so we take absolute value)
    const discountSum = discounts
      .filter((discount: any) => discount.adjustmentSource !== 'PROMOTION:237')
      .reduce((sum: number, discount: any) => {
        // Handle both Money object (with value property) and direct number
        let discountAmount = 0;
        if (
          discount.amountWithTax !== undefined &&
          discount.amountWithTax !== null
        ) {
          discountAmount =
            typeof discount.amountWithTax === 'object'
              ? discount.amountWithTax.value || 0
              : discount.amountWithTax;
        } else if (discount.amount !== undefined && discount.amount !== null) {
          discountAmount =
            typeof discount.amount === 'object'
              ? discount.amount.value || 0
              : discount.amount;
        }
        const promotion = promotions?.find(
          (promotion: any) =>
            'PROMOTION:' + promotion.id === discount.adjustmentSource,
        );
        if (promotion?.couponCode) {
          couponOfferAmount = couponOfferAmount + Math.abs(discountAmount);
        } else {
          additionalOfferAmount =
            additionalOfferAmount + Math.abs(discountAmount);
        }
        // Take absolute value since discounts are typically negative
        return sum + Math.abs(discountAmount);
      }, 0);
    return {
      totalDiscount: discountSum,
      additionalOfferAmount,
      couponOfferAmount,
    };
  }, [order]);

  // Handle fetcher response for different payment methods
  useEffect(() => {
    if (fetcher.data) {
      console.log('Payment fetcher response:', fetcher.data);

      if (fetcher.data && 'success' in fetcher.data && fetcher.data.success) {
        const { paymentMethod, paymentToken, paymentUrl, orderCode } =
          fetcher.data as any;

        if (paymentMethod === 'easebuzz') {
          console.log(
            'Redirecting to Easebuzz payment page with token:',
            paymentToken,
          );
          const easebuzzUrl = paymentUrl;
          console.log('Attempting to redirect to:', easebuzzUrl);
          window.location.href = easebuzzUrl;
        } else if (paymentMethod === 'hdfc') {
          console.log('HDFC payment method selected');
          console.log('HDFC payment URL:', paymentUrl);

          if (paymentUrl) {
            console.log(
              'Redirecting to HDFC payment page with URL:',
              paymentUrl,
            );
            window.location.href = paymentUrl;
          } else {
            console.error('No HDFC payment URL received');
            setError('Failed to get HDFC payment URL. Please try again.');
            setIsProcessing(false);
          }
        } else if (paymentMethod === 'razorpay') {
          console.log(
            'Razorpay payment method selected, order code:',
            orderCode,
          );
          navigate(`/checkout2/confirmation/${orderCode}?status=success`);
        } else {
          console.error(
            'Unknown payment method or missing payment data:',
            paymentMethod,
          );
          setError('Failed to process payment. Please try again.');
          setIsProcessing(false);
        }
      } else if ('error' in fetcher.data) {
        setError(fetcher.data?.error as string);
        setIsProcessing(false);
      }
    }
  }, [fetcher.data, navigate]);

  const handlePaymentMethodChange = (method: string) => {
    console.log(
      'Payment method changed from',
      selectedPaymentMethod,
      'to',
      method,
    );
    setSelectedPaymentMethod(method);
    setError(null);
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'razorpay') {
      // Razorpay UI is handled by `RazorpayPayments` component.
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      console.log(
        'Starting payment process for method:',
        selectedPaymentMethod,
      );
      console.log('Order details:', {
        code: order.code,
        totalWithTax: order.totalWithTax,
        state: order.state,
        lines: order.lines?.length || 0,
        subTotal: order.subTotal,
        subTotalWithTax: order.subTotalWithTax,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
      });

      // Extra safety: block unconfigured payment methods at submit-time
      if (!isMethodEnabledByConfig(selectedPaymentMethod, paymentConfig)) {
        setError(
          `${selectedPaymentMethod} is not configured. Please choose another payment method.`,
        );
        setIsProcessing(false);
        return;
      }

      const form = new FormData();
      form.append('action', 'addPaymentToOrder');
      form.append('paymentMethodCode', selectedPaymentMethod);
      form.append('orderCode', order.code);
      form.append('amount', order.totalWithTax.toString());
      // form.append(
      //   'description',
      //   `Order ${order.code} - ${order.lines.length} items`,
      // );
      // form.append(
      //   'name',
      //   formData.shippingFullName || 'Customer',
      // );
      // form.append(
      //   'email',
      //   formData.shippingEmailAddress || 'customer@example.com',
      // );

      // Create payment data based on selected method using form data
      let paymentData: any = {
        method: selectedPaymentMethod,
        orderId: order.code,
        amount: order.totalWithTax,
        description: `Order ${order.code} - ${order.lines.length} items`,
        customerId: order.customer?.id,
        customerName: formData.shippingFullName || 'Customer',
        customerEmail: formData.shippingEmailAddress || 'customer@example.com',
        customerPhone: formData.shippingPhoneNumber || '6291040600',
        productInfo: `Order ${order.code}`,
      };

      if (selectedPaymentMethod === 'easebuzz') {
      } else if (selectedPaymentMethod === 'hdfc') {
      } else if (selectedPaymentMethod === 'razorpay') {
        paymentData = {
          ...paymentData,
          currency: order.currencyCode || 'INR',
        };
      }

      console.log('Payment data for', selectedPaymentMethod, ':', paymentData);
      form.append('paymentNonce', JSON.stringify(paymentData));

      console.log('Submitting payment form to action...');
      fetcher.submit(form, { method: 'post' });
    } catch (error) {
      console.error('Error in handlePayment:', error);
      setError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Transform server payment methods to match component format
  const paymentMethods =
    eligiblePaymentMethods
      ?.filter((method) => method.isEligible)
      ?.map((method) => ({
        id: method.code,
        name: method.name,
        description: method.description || `Pay with ${method.name}`,
        icon: getPaymentMethodIcon(method.code),
        popular: ['easebuzz', 'hdfc', 'razorpay'].includes(method.code),
      })) || [];

  // Helper function to get icon based on payment method code
  function getPaymentMethodIcon(code: string): string {
    const codeLower = code.toLowerCase();
    if (codeLower.includes('easebuzz')) return 'credit-card';
    if (codeLower.includes('hdfc')) return 'bank';
    if (codeLower.includes('razorpay')) return 'smartphone';
    if (codeLower.includes('stripe')) return 'wallet';
    if (codeLower.includes('braintree')) return 'shield';
    if (codeLower.includes('paypal')) return 'wallet';
    if (codeLower.includes('upi')) return 'smartphone';
    return 'credit-card';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <LockIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Complete Payment
            </h2>
          </div>
          <div className="text-gray-600">
            <p className="font-medium">Order #{orderCode}</p>
            <p className="text-sm">
              Please select a payment method below to complete your order.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Choose Payment Method
          </h2>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No payment methods are currently available.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please contact support for assistance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePaymentMethodChange(method.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedPaymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPaymentMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                        {method.popular && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.description}
                      </p>
                      {/* {selectedPaymentMethod === method.id && (
                        <div className="mt-2 text-xs text-indigo-600">
                          ✓ Selected - {method.id === 'easebuzz' ? 'Will redirect to Easebuzz payment page' : 
                            method.id === 'hdfc' ? 'Will redirect to HDFC payment page' :
                            method.id === 'razorpay' ? 'Will use Razorpay payment flow' :
                            'Will process payment directly'}
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Button / Razorpay Popup */}
          {selectedPaymentMethod === 'razorpay' ? (
            <div className="mt-8">
              {razorpayOrderId ? (
                <RazorpayPayments
                  orderCode={orderCode}
                  amount={order.totalWithTax}
                  description={`Order ${orderCode} - ${
                    order.lines?.length || 0
                  } items`}
                  name={
                    formData.shippingFullName ||
                    customer?.firstName ||
                    'Customer'
                  }
                  email={
                    formData.shippingEmailAddress ||
                    customer?.emailAddress ||
                    ''
                  }
                  razorpayOrderId={razorpayOrderId}
                  razorpayKeyId={razorpayKeyId}
                />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  Unable to start Razorpay. Please try again.
                </div>
              )}
            </div>
          ) : (
            paymentMethods.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || fetcher.state === 'submitting'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing || fetcher.state === 'submitting' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <LockIcon className="w-5 h-5" />
                      Pay {formatPrice(order.totalWithTax, order.currencyCode)}
                    </>
                  )}
                </button>
              </div>
            )
          )}

          {/* Security Notice */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your payment information is encrypted and secure. We use
                  industry-standard security measures to protect your data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Security & Privacy
            </h2>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Your payment information is encrypted and secure</p>
            <p>• We use industry-standard SSL encryption</p>
            <p>• Your personal data is protected and never shared</p>
            <p>• All transactions are monitored for fraud protection</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h3>

          {/* Order Info */}
          <div className="mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Code</span>
              <span className="text-gray-900 font-mono">{order.code}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-6">
            {order.lines.map((line: any) => (
              <div key={line.id} className="flex items-center gap-3">
                {/* {line.featuredAsset?.preview && (
                  <img
                    src={line.featuredAsset.preview}
                    alt={
                      line.productVariant.product?.name ||
                      line.productVariant.name
                    }
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )} */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {line.productVariant.product?.name ||
                      line.productVariant.name}
                  </p>
                  <p className="text-xs text-gray-600">Qty: {line.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(line.linePriceWithTax, order.currencyCode)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {formatPrice(
                  order.subTotalWithTax +
                    (offerAmountDetail?.totalDiscount || 0),
                  order.currencyCode,
                )}
              </span>
            </div>
            {offerAmountDetail &&
              offerAmountDetail.additionalOfferAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Additional Offer Applied</span>
                  <span className="font-medium">
                    -
                    {formatPrice(
                      offerAmountDetail.additionalOfferAmount,
                      order.currencyCode,
                    )}
                  </span>
                </div>
              )}
            {offerAmountDetail && offerAmountDetail.couponOfferAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Offer</span>
                <span className="font-medium">
                  -
                  {formatPrice(
                    offerAmountDetail.couponOfferAmount,
                    order.currencyCode,
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">
                {order.shippingWithTax > 0
                  ? formatPrice(order.shippingWithTax, order.currencyCode)
                  : 'Free'}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(order.totalWithTax, order.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.customer && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Customer
              </h4>
              <p className="text-sm text-gray-600">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {order.customer.emailAddress}
              </p>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Shipping Address
              </h4>
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.streetLine1}</p>
                {order.shippingAddress?.streetLine2 && (
                  <p>{order.shippingAddress?.streetLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.countryCode}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
