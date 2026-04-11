import {
  MetaFunction,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { APP_META_TITLE } from '~/constants';
import { getTopAnnouncementsForLayout } from '~/providers/announcements';
import {
  getOrderByCode,
} from '~/providers/orders/order';
import { formatPrice } from '~/providers/cart/vendureCart';
import {
  CheckIcon,
  XIcon,
  InfoIcon,
  FileTextIcon,
  ShoppingBagIcon,
  ClockIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { pushToDataLayer } from '~/utils/analytics';

export const meta: MetaFunction = () => {
  return [
    {
      title: `Order Confirmation - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: 'Your order confirmation details',
    },
  ];
};

export async function loader({ request, params }: DataFunctionArgs) {
  const url = new URL(request.url);
  const orderCode = params.orderCode; // Get from path params instead of query params
  const status = url.searchParams.get('status'); // 'success' or 'failure'
  const error = url.searchParams.get('error');

  console.log('=== CONFIRMATION PAGE LOADER ===');
  console.log('Full URL:', url.toString());
  console.log('Order Code (from path):', orderCode);
  console.log('Status:', status);
  console.log('Error:', error);
  console.log(
    'All search params:',
    Object.fromEntries(url.searchParams.entries()),
  );
  console.log('Path params:', params);

  if (!orderCode) {
    console.log('No order code provided in path, redirecting to checkout2');
    return redirect('/checkout2');
  }

  // Get the order data using getOrderByCode
  let order = null;

  try {
    console.log('Attempting to get order data...');
    order = await getOrderByCode(orderCode, { request });
    console.log('Order data retrieved:', {
      id: order?.id,
      code: order?.code,
      state: order?.state,
      active: order?.active,
      totalWithTax: order?.totalWithTax,
      linesCount: order?.lines?.length || 0,
      customerId: order?.customer?.id,
    });
  } catch (orderError) {
    console.error(
      '[Confirmation] Could not get order data:',
      orderError,
    );
  }

  // Try to get announcements, but don't fail if we can't
  let announcements: any[] = [];
  try {
    console.log('Attempting to load announcements...');
    announcements = await getTopAnnouncementsForLayout({ request });
    console.log('Announcements loaded successfully:', announcements.length);
  } catch (announcementError) {
    console.log('Could not load announcements:', announcementError);
  }

  // Determine payment status based on order state and URL status parameter
  let paymentStatus = 'failure';
  let isSuccess = false;
  let isPending = false;
  let isFailure = false;
  let isCancelled = false;

  if (!order) {
    // Order couldn't be loaded — fall back to URL status param
    paymentStatus = status || 'success';
    isSuccess = paymentStatus === 'success';
    isPending = paymentStatus === 'pending';
    isFailure = paymentStatus === 'failure';
    isCancelled = paymentStatus === 'cancelled';
  } else {
    // Use order state to determine status
    switch (order.state) {
      case 'PaymentSettled':
        paymentStatus = 'success';
        isSuccess = true;
        break;
      case 'PaymentAuthorized':
        paymentStatus = 'pending';
        isPending = true;
        break;
      case 'Cancelled':
        paymentStatus = 'cancelled';
        isCancelled = true;
        break;
      case 'ArrangingPayment':
        if (status === 'cancelled') {
          paymentStatus = 'cancelled';
          isCancelled = true;
        } else {
          paymentStatus = 'failure';
          isFailure = true;
        }
        break;
      default:
        paymentStatus = status || 'failure';
        isSuccess = status === 'success';
        isPending = status === 'pending';
        isFailure = status === 'failure';
        isCancelled = status === 'cancelled';
    }
  }

  console.log('Payment status determination:', {
    orderState: order?.state,
    orderActive: order?.active,
    urlStatus: status,
    finalStatus: paymentStatus,
    isSuccess,
    isPending,
    isFailure,
    isCancelled,
  });

  console.log('Final order data:', order);
  console.log('Final response data:', {
    orderCode: order?.code,
    status: paymentStatus,
    error,
    announcementsCount: announcements.length,
  });

  return json({
    order,
    orderCode,
    status: paymentStatus,
    error,
    announcements: announcements || [],
  });
}

export default function Checkout2Confirmation() {
  const { order, orderCode, status, error, announcements } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSuccess = status === 'success';
  const isPending = status === 'pending';
  const isFailure = status === 'failure';
  const isCancelled = status === 'cancelled';

  const displayCode = order?.code || orderCode || '';


  // Calculate discount breakdown
  const offerAmountDetail: {totalDiscount: number; additionalOfferAmount: number; couponOfferAmount: number} = useMemo(() => {
    if (!order) return {totalDiscount: 0, additionalOfferAmount: 0, couponOfferAmount: 0};
    const discounts = order?.discounts;
    const promotions = order?.promotions;
    if (!discounts || discounts.length === 0) {
      return {totalDiscount: 0, additionalOfferAmount: 0, couponOfferAmount: 0};
    }
    let additionalOfferAmount = 0;
    let couponOfferAmount = 0;
    // Sum all discounts (amounts may be negative, so we take absolute value)
    const discountSum = discounts.filter((discount: any) => discount.adjustmentSource !== 'PROMOTION:237').reduce((sum: number, discount: any) => {
      // Handle both Money object (with value property) and direct number
      let discountAmount = 0;
      if (discount.amountWithTax !== undefined && discount.amountWithTax !== null) {
        discountAmount = typeof discount.amountWithTax === 'object' 
          ? discount.amountWithTax.value || 0 
          : discount.amountWithTax;
      } else if (discount.amount !== undefined && discount.amount !== null) {
        discountAmount = typeof discount.amount === 'object' 
          ? discount.amount.value || 0 
          : discount.amount;
      }
      const promotion = promotions?.find((promotion: any) => "PROMOTION:"+ promotion.id === discount.adjustmentSource);
      if (promotion?.couponCode) {
        couponOfferAmount = couponOfferAmount + Math.abs(discountAmount);
      } else {
        additionalOfferAmount = additionalOfferAmount + Math.abs(discountAmount);
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

  const handleContinueShopping = () => {
    console.log('Continue shopping clicked');
    navigate('/');
  };

  const handleViewAccount = () => {
    navigate(`/account`);
  };

  // Track if purchase event has been sent for this order code
  const purchaseEventSentRef = useRef<string | null>(null);

  useEffect(() => {
    // Only execute once per order code, even if effect runs multiple times (React StrictMode)
    if (
      order && 
      order.state === 'PaymentSettled' && 
      order.code &&
      purchaseEventSentRef.current !== order.code
    ) {
      // Mark this order as processed
      purchaseEventSentRef.current = order.code;
      
      pushToDataLayer({
        'event': 'purchase',
        'ecommerce': {
          'transaction_id': order.code,
          'value': order.totalWithTax / 100,
          'currency': 'INR',
          'items': order.lines.map(line => ({
            'item_id': line.productVariant.sku,
            'item_name': line.customFields?.additionalInformation ? JSON.parse(line.customFields?.additionalInformation).sellerSku || null : null,
            'price': line.unitPriceWithTax / 100,
            'quantity': line.quantity,
          }))
        }
      });
    }
  }, [order?.state, order?.code]);

  return (
    <div className={`grid grid-cols-1 ${order ? 'lg:grid-cols-3' : ''} gap-8`}>
      {/* Main Content */}
      <div className={`${order ? 'lg:col-span-2' : ''} space-y-6`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isSuccess
                ? 'bg-green-100'
                : isPending
                ? 'bg-yellow-100'
                : isCancelled
                ? 'bg-orange-100'
                : 'bg-red-100'
            }`}
          >
            {isSuccess ? (
              <CheckIcon className="w-8 h-8 text-green-600" />
            ) : isPending ? (
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            ) : isCancelled ? (
              <XIcon className="w-8 h-8 text-orange-600" />
            ) : (
              <XIcon className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {isSuccess
              ? 'Payment Successful!'
              : isPending
              ? 'Payment Pending'
              : isCancelled
              ? 'Payment Cancelled'
              : 'Payment Failed'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSuccess
              ? 'Thank you for your purchase. Your order has been confirmed.'
              : isPending
              ? 'Your payment is being processed. We will notify you once it is confirmed.'
              : isCancelled
              ? 'Your payment was cancelled. No charges have been made to your account.'
              : "We're sorry, but your payment could not be processed at this time."}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {isSuccess ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Confirmation
              </h2>

              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {displayCode}
                  </p>
                </div>
                {order?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                )}
                {order?.totalWithTax != null && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formatPrice(order.totalWithTax, order.currencyCode)}
                  </p>
                </div>
                )}
              </div>

              {/* Order Items */}
              {order?.lines && order.lines.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.lines.map((line: any) => (
                      <div
                        key={line.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {line.productVariant.product?.name ||
                              line.productVariant.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Quantity: {line.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(
                            line.linePriceWithTax,
                            order.currencyCode
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
              )}

              {/* Next Steps */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-indigo-900 mb-2">
                  What's Next?
                </h3>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• You will receive an email confirmation shortly</li>
                  <li>
                    • Your order will be processed within 1-2 business days
                  </li>
                  <li>• You can track your order status in your account</li>
                  <li>• For any questions, please contact our support team</li>
                </ul>
              </div>
            </>
          ) : isPending ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment Processing
              </h2>

              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {displayCode}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {formatPrice(order.totalWithTax, order.currencyCode)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <p className="text-sm text-yellow-600 font-medium">
                    Pending Confirmation
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {order.lines.map((line: any) => (
                      <div
                        key={line.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {line.featuredAsset?.preview && (
                          <img
                            src={line.featuredAsset.preview}
                            alt={
                              line.productVariant.product?.name ||
                              line.productVariant.name
                            }
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {line.productVariant.product?.name ||
                              line.productVariant.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Quantity: {line.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(
                            line.linePriceWithTax,
                            order.currencyCode
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pending Status Info */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      Payment Processing
                    </h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your payment is currently being processed by our payment
                      provider. This usually takes a few minutes to complete.
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Next for Pending */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-indigo-900 mb-2">
                  What's Next?
                </h3>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>
                    • We will send you an email confirmation once payment is
                    confirmed
                  </li>
                  <li>
                    • Your order will be processed within 1-2 business days
                    after payment confirmation
                  </li>
                  <li>• You can track your order status in your account</li>
                  <li>
                    • If payment fails, you will be notified and can retry
                  </li>
                  <li>• For any questions, please contact our support team</li>
                </ul>
              </div>
            </>
          ) : isCancelled ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment Cancelled
              </h2>

              <div className="space-y-4 text-gray-600">
                <p>
                  You cancelled the payment process. No charges have been made
                  to your account.
                </p>
                <p>
                  Your order has been saved and you can retry the payment at any
                  time. The order will be processed once payment is successful.
                </p>
              </div>

              <div className="mt-8 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-indigo-900">
                      No charges made
                    </h3>
                    <p className="text-sm text-indigo-800 mt-1">
                      Your payment was cancelled before completion. No money has
                      been deducted from your account.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                What happened?
              </h2>

              <div className="space-y-4 text-gray-600">
                <p>
                  Your payment could not be processed due to one of the
                  following reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Insufficient funds in your account</li>
                  <li>Card details entered incorrectly</li>
                  <li>Network connectivity issues</li>
                  <li>Payment gateway timeout</li>
                  <li>Card expired or blocked</li>
                </ul>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Error Details:</strong> {error}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      Don't worry!
                    </h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your order has been saved and you can retry the payment.
                      The order will be processed once payment is successful.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleViewAccount}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <FileTextIcon className="w-4 h-4" />
              View My Account
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3A6BFC] text-white font-medium rounded-xl hover:bg-[#2d5ae0] transition-colors"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {order && (
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Code</span>
                <span className="text-gray-900 font-mono">{displayCode}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Date</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-medium ${
                    isSuccess
                      ? 'text-green-600'
                      : isPending
                      ? 'text-yellow-600'
                      : isCancelled
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                >
                  {isSuccess
                    ? 'Confirmed'
                    : isPending
                    ? 'Processing'
                    : isCancelled
                    ? 'Cancelled'
                    : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Amount</span>
                <span className="text-gray-900 font-semibold">
                  {formatPrice(order.totalWithTax, order.currencyCode)}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {order.lines.map((line: any) => (
                  <div key={line.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {line.productVariant.product?.name ||
                          line.productVariant.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty: {line.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(line.linePriceWithTax, order.currencyCode)}
                    </p>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice((order.subTotalWithTax || 0) + (offerAmountDetail?.totalDiscount || 0), order.currencyCode)}
                </span>
              </div>
              {offerAmountDetail && offerAmountDetail.additionalOfferAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Additional Offer Applied</span>
                  <span className="font-medium">
                    -{formatPrice(offerAmountDetail.additionalOfferAmount, order.currencyCode)}
                  </span>
                </div>
              )}
              {offerAmountDetail && offerAmountDetail.couponOfferAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Offer</span>
                  <span className="font-medium">
                    -{formatPrice(offerAmountDetail.couponOfferAmount, order.currencyCode)}
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

            {isPending && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <ClockIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">
                      Payment Processing
                    </h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Your payment is being verified. You'll receive an email
                      confirmation once it's confirmed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.customer && (
              <div className="pt-4 border-t border-gray-200">
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

            {isSuccess && order.shippingAddress && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Shipping Address
                </h4>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.streetLine1}</p>
                  {order.shippingAddress.streetLine2 && (
                    <p>{order.shippingAddress.streetLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.province}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.phoneNumber && (
                    <p className="mt-1">
                      Phone: {order.shippingAddress.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
