import {
  useLoaderData,
  useOutletContext,
  useNavigate,
  useFetcher,
} from '@remix-run/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DataFunctionArgs,
  ActionFunctionArgs,
  json,
  redirect,
} from '@remix-run/server-runtime';
import {
  AlertCircleIcon,
  UserIcon,
  UserCheckIcon,
  TruckIcon,
  CreditCardIcon,
  CheckIcon,
  InfoIcon,
  LockIcon,
  ShieldCheckIcon,
  X,
} from 'lucide-react';

// Import Vendure cart provider for order summary
import { formatPrice } from '~/providers/cart/vendureCart';
import {
  setCustomerForOrder,
  setOrderShippingAddress,
  setOrderBillingAddress,
  setOrderShippingMethod,
  transitionOrderToState,
  getNextOrderStates,
  getEligibleShippingMethods,
  getActiveOrder,
  setOrderCustomFields,
  applyCouponCode,
  removeCouponCode,
} from '~/providers/orders/order';
import { getActiveCustomer } from '~/providers/customer/customer';
import { ErrorCode } from '~/generated/graphql';
import { sdk } from '~/graphqlWrapper';
import { getCollectionBySlug } from '~/providers/collections/collections';

export async function loader({ request }: DataFunctionArgs) {
  try {
    const eligibleShippingMethods = await getEligibleShippingMethods({
      request,
    });
    // Fetch countries from Vendure
    const { availableCountries } = await sdk.availableCountries(undefined, {
      request,
    });
    const countries = availableCountries ?? [];

    // Fetch states collection
    let statesData = {};
    try {
      const { collection } = await getCollectionBySlug('states', { request });
      if (collection?.customFields?.customData) {
        statesData = JSON.parse(collection.customFields.customData);
      }
    } catch (error) {
      console.error('Error fetching states collection:', error);
    }
    return json({
      eligibleShippingMethods: eligibleShippingMethods || [],
      countries,
      statesData,
    });
  } catch (error) {
    console.error('Checkout index loader error:', error);
    return json({
      eligibleShippingMethods: [],
      countries: [],
      statesData: {},
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    switch (action) {
      case 'proceedToPayment': {
        // Check if user is already logged in
        const activeCustomer = await getActiveCustomer({ request });
        const isSignedIn = !!activeCustomer?.activeCustomer?.id;

        console.log('User authentication status:', {
          isSignedIn,
          activeCustomer,
        });

        let order;

        if (!isSignedIn) {
          // User is not logged in, set customer information
          const customerData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            emailAddress: formData.get('emailAddress') as string,
            phoneNumber: formData.get('phoneNumber') as string,
            customFields: {
              icaiRegistrationNumber: formData.get(
                'icaiRegistrationNumber',
              ) as string,
            },
          };

          console.log('Setting customer for guest user:', customerData);
          const customerResult = await setCustomerForOrder(customerData, {
            request,
          });
          console.log('customerResult', customerResult);
          if (customerResult.setCustomerForOrder?.__typename !== 'Order') {
            const errorCode =
              customerResult.setCustomerForOrder?.errorCode ||
              'CUSTOMER_SET_ERROR';
            let errorMessage =
              customerResult.setCustomerForOrder?.message ||
              'Failed to set customer information';

            // Handle specific error cases
            if (errorCode === ErrorCode.EMAIL_ADDRESS_CONFLICT_ERROR) {
              errorMessage =
                'This email address is already registered. Please log in or use a different email address.';
            } else if (errorCode === ErrorCode.INVALID_CREDENTIALS_ERROR) {
              errorMessage = 'Please enter a valid email address.';
            } else if (errorCode === ErrorCode.GUEST_CHECKOUT_ERROR) {
              errorMessage =
                'This phone number is already registered. Please use a different phone number.';
            }

            return json({
              success: false,
              error: {
                errorCode: errorCode,
                message: errorMessage,
              },
            });
          }
          order = customerResult.setCustomerForOrder;
        } else {
          // User is logged in, get the current order
          console.log('User is already logged in, using existing order');
          const activeOrder = await getActiveOrder({ request });
          if (!activeOrder) {
            return json({
              success: false,
              error: {
                errorCode: 'NO_ACTIVE_ORDER',
                message:
                  'No active order found. Please add items to your cart and try again.',
              },
            });
          }
          order = activeOrder;
        }

        // Extract shipping and billing address data
        const shippingAddressData = {
          fullName: formData.get('shippingAddress.fullName') as string,
          streetLine1: formData.get('shippingAddress.streetLine1') as string,
          streetLine2: formData.get('shippingAddress.streetLine2') as string,
          city: formData.get('shippingAddress.city') as string,
          province: formData.get('shippingAddress.province') as string,
          postalCode: formData.get('shippingAddress.postalCode') as string,
          countryCode: formData.get('shippingAddress.countryCode') as string,
          phoneNumber: formData.get('shippingAddress.phoneNumber') as string,
          company: formData.get('shippingAddress.company') as string,
          customFields: {
            emailAddress: formData.get(
              'shippingAddress.emailAddress',
            ) as string,
          },
        };

        const billingAddressData = {
          fullName: formData.get('billingAddress.fullName') as string,
          streetLine1: formData.get('billingAddress.streetLine1') as string,
          streetLine2: formData.get('billingAddress.streetLine2') as string,
          city: formData.get('billingAddress.city') as string,
          province: formData.get('billingAddress.province') as string,
          postalCode: formData.get('billingAddress.postalCode') as string,
          countryCode: formData.get('billingAddress.countryCode') as string,
          phoneNumber: formData.get('billingAddress.phoneNumber') as string,
          company: formData.get('billingAddress.company') as string,
          customFields: {
            emailAddress: formData.get('billingAddress.emailAddress') as string,
          },
        };

        const paymentMethod = formData.get('paymentMethod') as string;

        console.log('Processing payment with data:', {
          isSignedIn,
          shippingAddressData,
          billingAddressData,
          paymentMethod,
        });

        let finalOrder = order;
        if (order?.state === 'AddingItems') {
          // Set shipping address (only allowed in AddingItems)
          const shippingResult = await setOrderShippingAddress(
            shippingAddressData,
            { request },
          );
          if (shippingResult.setOrderShippingAddress?.__typename !== 'Order') {
            return json({
              success: false,
              error: {
                errorCode:
                  shippingResult.setOrderShippingAddress?.errorCode ||
                  'SHIPPING_ADDRESS_ERROR',
                message:
                  shippingResult.setOrderShippingAddress?.message ||
                  'Failed to set shipping address',
              },
            });
          }
          const billingResult = await setOrderBillingAddress(
            billingAddressData,
            { request },
          );
          if (billingResult.setOrderBillingAddress?.__typename !== 'Order') {
            return json({
              success: false,
              error: {
                errorCode:
                  billingResult.setOrderBillingAddress?.errorCode ||
                  'BILLING_ADDRESS_ERROR',
                message:
                  billingResult.setOrderBillingAddress?.message ||
                  'Failed to set billing address',
              },
            });
          }

          // Set the selected shipping method (only allowed in AddingItems)
          const selectedShippingMethodId = formData.get(
            'selectedShippingMethodId',
          ) as string;

          // if (!selectedShippingMethodId) {
          //   return json({
          //     success: false,
          //     error: {
          //       errorCode: 'MISSING_SHIPPING_METHOD',
          //       message: 'Please select a delivery method before proceeding to payment'
          //     }
          //   });
          // }

          console.log(
            'Setting selected shipping method:',
            selectedShippingMethodId,
          );
          const shippingMethodResult = await setOrderShippingMethod(
            selectedShippingMethodId,
            { request },
          );
          console.log('shippingMethodResult', shippingMethodResult);
          const orderCustomFieldsResult = await setOrderCustomFields(
            {
              customFields: {
                attemptYear: order.lines
                  .map(
                    (line) =>
                      JSON.parse(
                        line.customFields?.additionalInformation || '{}',
                      ).attempt,
                  )
                  .join(',') as any as string,
              },
            },
            { request },
          );
          if (
            orderCustomFieldsResult.setOrderCustomFields?.__typename !== 'Order'
          ) {
            return json({
              success: false,
              error: {
                errorCode:
                  orderCustomFieldsResult.setOrderCustomFields?.errorCode ||
                  'ORDER_CUSTOM_FIELDS_ERROR',
                message:
                  orderCustomFieldsResult.setOrderCustomFields?.message ||
                  'Failed to set order custom fields',
              },
            });
          }
          if (
            shippingMethodResult.setOrderShippingMethod?.__typename !== 'Order'
          ) {
            return json({
              success: false,
              error: {
                errorCode:
                  shippingMethodResult.setOrderShippingMethod?.errorCode ||
                  'SHIPPING_METHOD_ERROR',
                message:
                  shippingMethodResult.setOrderShippingMethod?.message ||
                  'Failed to set shipping method',
              },
            });
          }

          finalOrder = shippingMethodResult.setOrderShippingMethod;
        } else {
          console.log(
            'Order not in AddingItems; skipping address/method updates. Current state:',
            order?.state,
          );
        }
        console.log(
          'Shipping method set successfully, current order state:',
          finalOrder.state,
        );

        // Check if we need to transition the order state to ArrangingPayment
        const nextOrderStates = await getNextOrderStates({ request });
        console.log('Next order states:', nextOrderStates);
        console.log('Current order state before transition:', finalOrder.state);

        if (nextOrderStates.includes('ArrangingPayment')) {
          console.log('Transitioning order to ArrangingPayment state...');
          const transitionResult = await transitionOrderToState(
            'ArrangingPayment',
            { request },
          );
          console.log('Order state transition result:', transitionResult);

          if (transitionResult.transitionOrderToState?.__typename !== 'Order') {
            console.error(
              'Order state transition failed:',
              transitionResult.transitionOrderToState,
            );
            return json({
              success: false,
              error: {
                errorCode:
                  transitionResult.transitionOrderToState?.errorCode ||
                  'ORDER_STATE_TRANSITION_ERROR',
                message:
                  transitionResult.transitionOrderToState?.message ||
                  'Failed to transition order state',
              },
            });
          }

          // Use the transitioned order
          const transitionedOrder = transitionResult.transitionOrderToState;
          console.log(
            'Order successfully transitioned to ArrangingPayment state, new state:',
            transitionedOrder.state,
          );

          // Return success with orderCode for client-side navigation to payment page
          console.log(
            'Returning success response with orderCode:',
            transitionedOrder.code,
          );
          return json({
            success: true,
            orderCode: transitionedOrder.code,
            orderId: transitionedOrder.id,
            paymentMethod: paymentMethod,
            readyForPayment: true,
          });
        } else {
          // Order is already in the correct state or cannot transition
          console.log(
            'Order is ready for payment, current state:',
            finalOrder.state,
            'redirecting to payment page',
          );

          // Return success with orderCode for client-side navigation to payment page
          console.log(
            'Returning success response with orderCode (no transition needed):',
            finalOrder.code,
          );
          return json({
            success: true,
            orderCode: finalOrder.code,
            orderId: finalOrder.id,
            paymentMethod: paymentMethod,
            readyForPayment: true,
          });
        }
      }

      case 'applyCoupon': {
        const couponCode = formData.get('couponCode') as string;

        if (!couponCode) {
          return json({
            success: false,
            error: {
              errorCode: 'MISSING_COUPON_CODE',
              message: 'Coupon code is required',
            },
          });
        }

        try {
          const result = await applyCouponCode(couponCode, { request });
          const couponResult = result.applyCouponCode;

          if ('errorCode' in couponResult) {
            return json({
              success: false,
              error: {
                errorCode: couponResult.errorCode || 'COUPON_ERROR',
                message: couponResult.message || 'Failed to apply coupon code',
              },
            });
          }

          return json({ success: true });
        } catch (error) {
          console.error('Error applying coupon code:', error);
          return json({
            success: false,
            error: {
              errorCode: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to apply coupon code',
            },
          });
        }
      }

      case 'removeCoupon': {
        const couponCode = formData.get('couponCode') as string;

        if (!couponCode) {
          return json({
            success: false,
            error: {
              errorCode: 'MISSING_COUPON_CODE',
              message: 'Coupon code is required',
            },
          });
        }

        try {
          const result = await removeCouponCode(couponCode, { request });
          const orderResult = result.removeCouponCode;

          if (!orderResult) {
            return json({
              success: false,
              error: {
                errorCode: 'REMOVE_COUPON_ERROR',
                message: 'Failed to remove coupon code',
              },
            });
          }

          return json({ success: true });
        } catch (error) {
          console.error('Error removing coupon code:', error);
          return json({
            success: false,
            error: {
              errorCode: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to remove coupon code',
            },
          });
        }
      }

      default:
        return json({
          success: false,
          error: {
            errorCode: 'INVALID_ACTION',
            message: 'Invalid action requested',
          },
        });
    }
  } catch (error) {
    console.error('Checkout index action error:', error);
    return json({
      success: false,
      error: {
        errorCode: 'INTERNAL_SERVER_ERROR',
        message:
          'An error occurred while processing your request. Please try again.',
      },
    });
  }
}

export default function Checkout2Index() {
  const { eligibleShippingMethods, countries, statesData } =
    useLoaderData<typeof loader>();
  const {
    cart,
    customer,
    defaultShippingAddress,
    defaultBillingAddress,
    setFormData: setContextFormData,
    setOrderCode,
  } = useOutletContext<{
    cart: any;
    customer: any;
    addresses: any[];
    defaultShippingAddress: any;
    defaultBillingAddress: any;
    formData: any;
    setFormData: (data: any) => void;
    orderCode: string | null;
    setOrderCode: (code: string | null) => void;
  }>();
  // Helper function to get states for selected country - memoized to prevent re-renders
  const getStatesForCountry = useCallback(
    (countryCode: string) => {
      if (!statesData || !countryCode) return [];

      // Handle different country code formats (IN, india, etc.)
      const normalizedCountryCode =
        countryCode === 'IN' ? 'india' : countryCode.toLowerCase();
      const statesDataObj = statesData as Record<string, any>;
      const countryKey = Object.keys(statesDataObj).find(
        (key) =>
          key.toLowerCase() === normalizedCountryCode ||
          key.toLowerCase() === normalizedCountryCode.toLowerCase(),
      );
    },
    [statesData],
  );
  // Fetch states for India once on component mount
  const [indiaStates, setIndiaStates] = useState<any[]>([]);

  useEffect(() => {
    if (!statesData) return;
    const statesDataObj = statesData as Record<string, any>;

    // The `states` collection customData shape can vary (e.g. keys like `IN`, `in`, `India`).
    // We do a case-insensitive match so India states always populate.
    const indiaKey = Object.keys(statesDataObj).find((key) => {
      const normalizedKey = key.toLowerCase();
      return normalizedKey === 'india' || normalizedKey === 'in';
    });

    const indiaStatesData = indiaKey ? statesDataObj[indiaKey] : [];

    const rawStates = Array.isArray(indiaStatesData)
      ? indiaStatesData
      : indiaStatesData && typeof indiaStatesData === 'object'
      ? Object.values(indiaStatesData)
      : [];

    const normalizeState = (s: any) => {
      if (s == null) return null;
      if (typeof s === 'string') {
        return { name: s, code: s, enabled: undefined };
      }
      if (typeof s === 'object') {
        const name =
          s.name ?? s.stateName ?? s.label ?? s.value ?? s.province ?? '';
        const code =
          s.code ?? s.stateCode ?? s.abbreviation ?? s.shortCode ?? name;
        return { name, code, enabled: s.enabled };
      }
      return null;
    };

    // Some datasets may not include `enabled`; treat missing `enabled` as enabled.
    const normalizedStates = rawStates
      .map(normalizeState)
      .filter(
        (s: any) => s && typeof s.name === 'string' && s.name.trim().length > 0,
      )
      .filter((s: any) => (typeof s.enabled === 'boolean' ? s.enabled : true));

    setIndiaStates(normalizedStates);
  }, [statesData]);
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  const [error, setError] = useState<
    string | { errorCode: string; message: string } | null
  >(null);

  // Coupon code state - simple input field
  const [couponCode, setCouponCode] = useState('');
  const couponFetcher = useFetcher<typeof action>();
  const removeCouponFetcher = useFetcher<typeof action>();
  const [couponError, setCouponError] = useState<string | null>(null);
  // Check if default shipping and billing addresses are the same
  const areDefaultAddressesSame =
    defaultShippingAddress &&
    defaultBillingAddress &&
    defaultShippingAddress.id === defaultBillingAddress.id;

  const [sameAsShipping, setSameAsShipping] = useState(areDefaultAddressesSame);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online');
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Calculate total discount amount
  const offerAmountDetail: {
    totalDiscount: number;
    additionalOfferAmount: number;
    couponOfferAmount: number;
  } = useMemo(() => {
    const discounts = 'discounts' in cart ? cart.discounts : undefined;
    const promotions = 'promotions' in cart ? cart.promotions : undefined;
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
        if (promotion.couponCode) {
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
  }, [cart]);

  // Set default shipping method to "courier" from eligible shipping methods
  useEffect(() => {
    if (
      eligibleShippingMethods &&
      eligibleShippingMethods.length > 0 &&
      !selectedShippingMethod
    ) {
      const courierMethod = eligibleShippingMethods.find(
        (method) =>
          method.name.toLowerCase().includes('courier') ||
          method.name.toLowerCase().includes('standard'),
      );
      if (courierMethod) {
        setSelectedShippingMethod(courierMethod.id);
        console.log(
          'Auto-selected shipping method:',
          courierMethod.name,
          courierMethod.id,
        );
      } else {
        // Fallback to first available method
        setSelectedShippingMethod(eligibleShippingMethods[0].id);
        console.log(
          'Auto-selected first shipping method:',
          eligibleShippingMethods[0].name,
          eligibleShippingMethods[0].id,
        );
      }
    }
  }, [eligibleShippingMethods, selectedShippingMethod]);

  // Update sameAsShipping state when default addresses change
  useEffect(() => {
    const addressesAreSame =
      defaultShippingAddress &&
      defaultBillingAddress &&
      defaultShippingAddress.id === defaultBillingAddress.id;
    setSameAsShipping(addressesAreSame);
  }, [defaultShippingAddress, defaultBillingAddress]);

  // Form state - aligned with Vendure Address structure
  // Ensure all values are strings to prevent controlled/uncontrolled input warnings
  const [formData, setFormData] = useState({
    // Customer Info - ensure all are strings
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    emailAddress: customer?.emailAddress || '',
    phoneNumber: customer?.phoneNumber || '',
    icaiRegistrationNumber:
      customer?.customFields?.icaiRegistrationNumber || '',

    // Shipping Address - ensure all are strings
    shippingFullName: defaultShippingAddress?.fullName || '',
    shippingCompany: defaultShippingAddress?.company || '',
    shippingStreetLine1: defaultShippingAddress?.streetLine1 || '',
    shippingStreetLine2: defaultShippingAddress?.streetLine2 || '',
    shippingCity: defaultShippingAddress?.city || '',
    shippingProvince: defaultShippingAddress?.province || '',
    shippingPostalCode: defaultShippingAddress?.postalCode || '',
    shippingCountryCode: defaultShippingAddress?.country?.code || 'IN',
    shippingPhoneNumber: defaultShippingAddress?.phoneNumber || '',
    shippingEmailAddress:
      defaultShippingAddress?.customFields?.emailAddress || '',

    // Billing Address - ensure all are strings
    billingFullName: defaultBillingAddress?.fullName || '',
    billingCompany: defaultBillingAddress?.company || '',
    billingStreetLine1: defaultBillingAddress?.streetLine1 || '',
    billingStreetLine2: defaultBillingAddress?.streetLine2 || '',
    billingCity: defaultBillingAddress?.city || '',
    billingProvince: defaultBillingAddress?.province || '',
    billingPostalCode: defaultBillingAddress?.postalCode || '',
    billingCountryCode: defaultBillingAddress?.country?.code || 'IN',
    billingPhoneNumber: defaultBillingAddress?.phoneNumber || '',
    billingEmailAddress:
      defaultBillingAddress?.customFields?.emailAddress || '',

    // Payment
    paymentMethod: 'online',

    // Options
    saveDetails: false,
    acceptPolicies: false,
  });

  // Handle coupon code application response - simple, no reloads
  useEffect(() => {
    if (couponFetcher.state === 'idle' && couponFetcher.data) {
      const fetcherData = couponFetcher.data;

      if ('success' in fetcherData && fetcherData.success) {
        // Clear input after successful application
        setCouponCode('');
        setCouponError(null);
      } else if ('error' in fetcherData && fetcherData.error) {
        const errorData = fetcherData.error;
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'message' in errorData
        ) {
          const errorObj = errorData as { message?: string };
          setCouponError(errorObj.message || 'Failed to apply coupon code');
        } else {
          setCouponError(
            typeof errorData === 'string'
              ? errorData
              : 'Failed to apply coupon code',
          );
        }
      }
    }
  }, [couponFetcher.data, couponFetcher.state]);

  // Handle remove coupon response - simple, no reloads
  useEffect(() => {
    if (removeCouponFetcher.state === 'idle' && removeCouponFetcher.data) {
      const fetcherData = removeCouponFetcher.data;

      if ('success' in fetcherData && fetcherData.success) {
        setCouponError(null);
      } else if ('error' in fetcherData && fetcherData.error) {
        const errorData = fetcherData.error;
        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'message' in errorData
        ) {
          const errorObj = errorData as { message?: string };
          setCouponError(errorObj.message || 'Failed to remove coupon code');
        } else {
          setCouponError(
            typeof errorData === 'string'
              ? errorData
              : 'Failed to remove coupon code',
          );
        }
      }
    }
  }, [removeCouponFetcher.data, removeCouponFetcher.state]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const codeToApply = couponCode.trim();

    if (!codeToApply) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Don't apply if already applied
    if (cart?.couponCodes?.includes(codeToApply)) {
      setCouponError('This coupon code is already applied');
      return;
    }

    // Don't apply if operation is in progress
    if (
      couponFetcher.state === 'submitting' ||
      removeCouponFetcher.state === 'submitting'
    ) {
      return;
    }

    setCouponError(null);

    couponFetcher.submit(
      { action: 'applyCoupon', couponCode: codeToApply },
      { method: 'post' },
    );
  };

  const handleRemoveCoupon = (codeToRemove: string) => {
    // Don't remove if operation is in progress
    if (
      couponFetcher.state === 'submitting' ||
      removeCouponFetcher.state === 'submitting'
    ) {
      return;
    }

    setCouponError(null);

    removeCouponFetcher.submit(
      { action: 'removeCoupon', couponCode: codeToRemove },
      { method: 'post' },
    );
  };

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data) {
      console.log('fetcher.data', fetcher.data, fetcher);

      // Type guard to check if it's a proceedToPayment response
      if (
        'orderCode' in fetcher.data &&
        fetcher.data.success &&
        'readyForPayment' in fetcher.data &&
        fetcher.data.readyForPayment
      ) {
        console.log(
          'Navigating to payment with orderCode:',
          fetcher.data.orderCode,
        );
        console.log('Selected payment method:', selectedPaymentMethod);

        // Handle proceedToPayment response - redirect to nested payment route
        // Store form data in Outlet context for the payment page to access
        const formDataToStore = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailAddress: formData.emailAddress,
          phoneNumber: formData.phoneNumber,
          icaiRegistrationNumber: formData.icaiRegistrationNumber,
          shippingFullName: formData.shippingFullName,
          shippingEmailAddress: formData.shippingEmailAddress,
          shippingPhoneNumber: formData.shippingPhoneNumber,
          shippingCompany: formData.shippingCompany,
          shippingStreetLine1: formData.shippingStreetLine1,
          shippingStreetLine2: formData.shippingStreetLine2,
          shippingCity: formData.shippingCity,
          shippingProvince: formData.shippingProvince,
          shippingPostalCode: formData.shippingPostalCode,
          shippingCountryCode: formData.shippingCountryCode,
          billingFullName: formData.billingFullName,
          billingEmailAddress: formData.billingEmailAddress,
          billingPhoneNumber: formData.billingPhoneNumber,
          billingCompany: formData.billingCompany,
          billingStreetLine1: formData.billingStreetLine1,
          billingStreetLine2: formData.billingStreetLine2,
          billingCity: formData.billingCity,
          billingProvince: formData.billingProvince,
          billingPostalCode: formData.billingPostalCode,
          billingCountryCode: formData.billingCountryCode,
          sameAsShipping: sameAsShipping,
        };
        console.log('formDataToStore', formDataToStore);
        // Store form data in Outlet context
        setContextFormData(formDataToStore);
        setOrderCode(fetcher.data.orderCode as string);

        const paymentUrl = `/checkout2/payment?orderCode=${fetcher.data.orderCode}&method=${selectedPaymentMethod}`;

        console.log('Payment URL:', paymentUrl);
        console.log(
          'Form data stored in Outlet context for order:',
          fetcher.data.orderCode,
        );
        navigate(paymentUrl);
      } else if ('error' in fetcher.data && !fetcher.data.success) {
        // Handle error response - check if error is structured or string
        const errorData = fetcher.data.error;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorObj = errorData as {
            errorCode?: string;
            message?: string;
          };
          if (errorObj.errorCode === 'EMAIL_ADDRESS_CONFLICT_ERROR') {
            setError('This email already has an account. Please log in.');
          } else {
            setError(errorObj.message || 'An error occurred');
          }
        } else {
          setError(
            (errorData as { errorCode?: string; message?: string })?.message ||
              'An error occurred',
          );
        }
      } else if (fetcher.data.success) {
        // Handle other successful responses
        console.log('Action completed successfully');
      }
    }
  }, [fetcher.data, selectedPaymentMethod, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;

    // Format phone numbers to only allow digits and limit to 10 digits
    if (
      (field === 'phoneNumber' ||
        field === 'shippingPhoneNumber' ||
        field === 'billingPhoneNumber') &&
      typeof value === 'string'
    ) {
      // Remove all non-digit characters and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      processedValue = digitsOnly;
    }

    // Format city names to only allow alphabets and spaces
    if (
      (field === 'shippingCity' || field === 'billingCity') &&
      typeof value === 'string'
    ) {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData((prev: any) => ({ ...prev, [field]: processedValue }));
    setError(null);

    // Sync billing fields when shipping fields are updated and checkbox is already checked
    if (
      sameAsShipping &&
      field.startsWith('shipping') &&
      typeof value === 'string'
    ) {
      const shippingToBillingMap: Record<string, string> = {
        shippingFullName: 'billingFullName',
        shippingCompany: 'billingCompany',
        shippingStreetLine1: 'billingStreetLine1',
        shippingStreetLine2: 'billingStreetLine2',
        shippingCity: 'billingCity',
        shippingProvince: 'billingProvince',
        shippingPostalCode: 'billingPostalCode',
        shippingCountryCode: 'billingCountryCode',
        shippingPhoneNumber: 'billingPhoneNumber',
        shippingEmailAddress: 'billingEmailAddress',
      };

      const billingField = shippingToBillingMap[field];
      if (billingField) {
        setFormData((prev: any) => ({
          ...prev,
          [billingField]: processedValue,
        }));
      }
    }

    // Clear field-specific errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for email and phone
    if (typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[6-9]\d{9}$/;

      if (
        (field === 'emailAddress' ||
          field === 'shippingEmailAddress' ||
          field === 'billingEmailAddress') &&
        value &&
        !emailRegex.test(value)
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: 'Please enter a valid email address',
        }));
      } else if (
        (field === 'phoneNumber' ||
          field === 'shippingPhoneNumber' ||
          field === 'billingPhoneNumber') &&
        value &&
        !phoneRegex.test(value.replace(/\D/g, ''))
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]:
            'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9',
        }));
      }
    }
  };

  const toggleBillingAddress = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      // Copy shipping address to billing address immediately
      setFormData((prev: any) => ({
        ...prev,
        billingFullName: prev.shippingFullName,
        billingCompany: prev.shippingCompany,
        billingStreetLine1: prev.shippingStreetLine1,
        billingStreetLine2: prev.shippingStreetLine2,
        billingCity: prev.shippingCity,
        billingProvince: prev.shippingProvince,
        billingPostalCode: prev.shippingPostalCode,
        billingCountryCode: prev.shippingCountryCode,
        billingPhoneNumber: prev.shippingPhoneNumber,
        billingEmailAddress: prev.shippingEmailAddress,
      }));

      // Clear billing address field errors when using shipping address
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.billingFullName;
        delete newErrors.billingStreetLine1;
        delete newErrors.billingCity;
        delete newErrors.billingProvince;
        delete newErrors.billingPostalCode;
        delete newErrors.billingEmailAddress;
        delete newErrors.billingPhoneNumber;
        delete newErrors.billingCompany;
        delete newErrors.billingStreetLine2;
        delete newErrors.billingCountryCode;
        return newErrors;
      });
    } else {
      // Reset billing address to default values when unchecking
      setFormData((prev: any) => ({
        ...prev,
        billingFullName: defaultBillingAddress?.fullName || '',
        billingCompany: defaultBillingAddress?.company || '',
        billingStreetLine1: defaultBillingAddress?.streetLine1 || '',
        billingStreetLine2: defaultBillingAddress?.streetLine2 || '',
        billingCity: defaultBillingAddress?.city || '',
        billingProvince: defaultBillingAddress?.province || '',
        billingPostalCode: defaultBillingAddress?.postalCode || '',
        billingCountryCode: defaultBillingAddress?.country?.code || 'IN',
        billingPhoneNumber: defaultBillingAddress?.phoneNumber || '',
        billingEmailAddress:
          defaultBillingAddress?.customFields?.emailAddress || '',
      }));
    }
  };

  const selectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
    setFormData((prev: any) => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = (actionType: string, data?: any) => {
    setError(null);

    const form = new FormData();
    form.append('action', actionType);

    if (data) {
      // Handle nested data structure
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects like shippingAddress, billingAddress
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            form.append(`${key}.${nestedKey}`, nestedValue as string);
          });
        } else {
          form.append(key, value as string);
        }
      });
    } else {
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString());
      });
    }

    fetcher.submit(form, { method: 'POST' });
  };

  // Form validation function
  const validateForm = () => {
    const errors: string[] = [];
    const newFieldErrors: { [key: string]: string } = {};

    // Validate required fields and set field-specific errors
    if (!formData.shippingFullName.trim()) {
      errors.push('Shipping full name is required');
      newFieldErrors.shippingFullName = 'Full name is required';
    }
    if (!formData.shippingEmailAddress.trim()) {
      errors.push('Shipping email is required');
      newFieldErrors.shippingEmailAddress = 'Email address is required';
    }
    if (!formData.shippingPhoneNumber.trim()) {
      errors.push('Shipping phone is required');
      newFieldErrors.shippingPhoneNumber = 'Phone number is required';
    }
    if (!formData.shippingStreetLine1.trim()) {
      errors.push('Shipping address is required');
      newFieldErrors.shippingStreetLine1 = 'Address is required';
    }
    if (!formData.shippingCity.trim()) {
      errors.push('Shipping city is required');
      newFieldErrors.shippingCity = 'City is required';
    }
    if (!formData.shippingPostalCode.trim()) {
      errors.push('Shipping postal code is required');
      newFieldErrors.shippingPostalCode = 'Postal code is required';
    }

    // Validate billing address if not same as shipping
    if (!sameAsShipping) {
      if (!formData.billingFullName.trim()) {
        errors.push('Billing full name is required');
        newFieldErrors.billingFullName = 'Full name is required';
      }
      if (!formData.billingStreetLine1.trim()) {
        errors.push('Billing address is required');
        newFieldErrors.billingStreetLine1 = 'Address is required';
      }
      if (!formData.billingCity.trim()) {
        errors.push('Billing city is required');
        newFieldErrors.billingCity = 'City is required';
      }
      if (!formData.billingPostalCode.trim()) {
        errors.push('Billing postal code is required');
        newFieldErrors.billingPostalCode = 'Postal code is required';
      }
      // Only require billing email if not using same address by default
      if (!areDefaultAddressesSame && !formData.billingEmailAddress.trim()) {
        errors.push('Billing email is required');
        newFieldErrors.billingEmailAddress = 'Email address is required';
      }
      if (!formData.billingPhoneNumber.trim()) {
        errors.push('Billing phone is required');
        newFieldErrors.billingPhoneNumber = 'Phone number is required';
      }
    } else {
      // Clear billing address errors when using shipping address
      delete newFieldErrors.billingFullName;
      delete newFieldErrors.billingStreetLine1;
      delete newFieldErrors.billingCity;
      delete newFieldErrors.billingProvince;
      delete newFieldErrors.billingPostalCode;
      delete newFieldErrors.billingEmailAddress;
      delete newFieldErrors.billingPhoneNumber;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.shippingEmailAddress &&
      !emailRegex.test(formData.shippingEmailAddress)
    ) {
      errors.push('Please enter a valid email address');
      newFieldErrors.shippingEmailAddress =
        'Please enter a valid email address';
    }

    // Validate phone format - exactly 10 digits starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.shippingPhoneNumber.replace(/\D/g, '');
    if (formData.shippingPhoneNumber && !phoneRegex.test(cleanPhone)) {
      errors.push(
        'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9',
      );
      newFieldErrors.shippingPhoneNumber =
        'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9';
    }

    // Validate billing email format if not same as shipping
    if (!sameAsShipping) {
      if (
        formData.billingEmailAddress &&
        !emailRegex.test(formData.billingEmailAddress)
      ) {
        errors.push('Please enter a valid billing email address');
        newFieldErrors.billingEmailAddress =
          'Please enter a valid email address';
      }

      // Validate billing phone format
      const cleanBillingPhone = formData.billingPhoneNumber.replace(/\D/g, '');
      if (formData.billingPhoneNumber && !phoneRegex.test(cleanBillingPhone)) {
        errors.push(
          'Please enter a valid 10-digit billing phone number starting with 6, 7, 8, or 9',
        );
        newFieldErrors.billingPhoneNumber =
          'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9';
      }
    }

    // Additional validation for guest users
    if (!customer) {
      if (!formData.firstName.trim()) {
        errors.push('First name is required');
        newFieldErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.push('Last name is required');
        newFieldErrors.lastName = 'Last name is required';
      }
      if (!formData.emailAddress.trim()) {
        errors.push('Email address is required');
        newFieldErrors.emailAddress = 'Email address is required';
      }
      if (!formData.phoneNumber.trim()) {
        errors.push('Phone number is required');
        newFieldErrors.phoneNumber = 'Phone number is required';
      }

      // Validate guest email format
      if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
        errors.push('Please enter a valid email address');
        newFieldErrors.emailAddress = 'Please enter a valid email address';
      }

      // Validate guest phone format
      const guestCleanPhone = formData.phoneNumber.replace(/\D/g, '');
      if (formData.phoneNumber && !phoneRegex.test(guestCleanPhone)) {
        errors.push(
          'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9',
        );
        newFieldErrors.phoneNumber =
          'Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9';
      }
    }

    // Validate other required selections
    if (!selectedPaymentMethod) {
      errors.push('Please select a payment method');
      newFieldErrors.paymentMethod = 'Please select a payment method';
    }

    if (!formData.acceptPolicies) {
      errors.push('Please accept the terms and policies');
      newFieldErrors.acceptPolicies = 'Please accept the terms and policies';
    }

    // Set field errors
    setFieldErrors(newFieldErrors);

    return errors;
  };

  const submitOrder = () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // Don't show general error at top when we have field-specific errors
      // The field-specific errors will be shown below each field
      return;
    }

    setError(null);

    // Prepare the data to send with the payment request
    const paymentData = {
      // Customer information (only for non-logged-in users)
      firstName: customer ? customer.firstName : formData.firstName,
      lastName: customer ? customer.lastName : formData.lastName,
      emailAddress: formData.shippingEmailAddress || formData.emailAddress,
      phoneNumber: formData.shippingPhoneNumber || formData.phoneNumber,
      icaiRegistrationNumber: formData.icaiRegistrationNumber,
      // Shipping address - aligned with Vendure Address structure
      shippingAddress: {
        fullName: formData.shippingFullName,
        company: formData.shippingCompany,
        streetLine1: formData.shippingStreetLine1,
        streetLine2: formData.shippingStreetLine2,
        city: formData.shippingCity,
        province: formData.shippingProvince,
        postalCode: formData.shippingPostalCode,
        countryCode: formData.shippingCountryCode,
        phoneNumber: formData.shippingPhoneNumber,
        emailAddress: formData.shippingEmailAddress,
      },

      // Billing address (use shipping if same, otherwise use billing) - aligned with Vendure Address structure
      billingAddress: sameAsShipping
        ? {
            fullName: formData.shippingFullName,
            company: formData.shippingCompany,
            streetLine1: formData.shippingStreetLine1,
            streetLine2: formData.shippingStreetLine2,
            city: formData.shippingCity,
            province: formData.shippingProvince,
            postalCode: formData.shippingPostalCode,
            countryCode: formData.shippingCountryCode,
            phoneNumber: formData.shippingPhoneNumber,
            emailAddress: formData.shippingEmailAddress,
          }
        : {
            fullName: formData.billingFullName,
            company: formData.billingCompany,
            streetLine1: formData.billingStreetLine1,
            streetLine2: formData.billingStreetLine2,
            city: formData.billingCity,
            province: formData.billingProvince,
            postalCode: formData.billingPostalCode,
            countryCode: formData.billingCountryCode,
            phoneNumber: formData.billingPhoneNumber,
            emailAddress:
              formData.billingEmailAddress ||
              (areDefaultAddressesSame ? formData.shippingEmailAddress : ''),
          },

      // Payment method and shipping method
      paymentMethod: selectedPaymentMethod,
      selectedShippingMethodId: selectedShippingMethod,

      // Additional options
      saveDetails: formData.saveDetails,
      acceptPolicies: formData.acceptPolicies,
    };

    console.log('Submitting payment data:', paymentData);
    handleSubmit('proceedToPayment', paymentData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {typeof error === 'string' ? error : error.message}
                </p>
                {typeof error === 'object' && error.errorCode && (
                  <p className="text-xs text-red-600 mt-1">
                    Error Code: {error.errorCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Information - Only for non-logged-in users */}
        {!customer && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    fieldErrors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    fieldErrors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) =>
                    handleInputChange('emailAddress', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    fieldErrors.emailAddress
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  required
                />
                {fieldErrors.emailAddress ? (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.emailAddress}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid email address
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    fieldErrors.phoneNumber
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  required
                />
                {fieldErrors.phoneNumber ? (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.phoneNumber}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 10-digit mobile number starting with 6, 7, 8, or 9
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ICAI Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.icaiRegistrationNumber}
                  onChange={(e) =>
                    handleInputChange('icaiRegistrationNumber', e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    fieldErrors.icaiRegistrationNumber
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  required
                />
                {fieldErrors.icaiRegistrationNumber ? (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.icaiRegistrationNumber}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter ICAI Registration Number
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Logged-in user info display */}
        {customer && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheckIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Information
              </h2>
            </div>
            <div className="text-gray-600">
              <p className="font-medium">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-sm">Email: {customer.emailAddress}</p>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <TruckIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping Address
            </h2>
            {defaultShippingAddress && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Using Default Address
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.shippingFullName}
                onChange={(e) =>
                  handleInputChange('shippingFullName', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingFullName
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.shippingFullName && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingFullName}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.shippingEmailAddress}
                onChange={(e) =>
                  handleInputChange('shippingEmailAddress', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingEmailAddress
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="example@email.com"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                required
              />
              {fieldErrors.shippingEmailAddress ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingEmailAddress}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Enter a valid email address
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.shippingPhoneNumber}
                onChange={(e) =>
                  handleInputChange('shippingPhoneNumber', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingPhoneNumber
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="9876543210"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                required
              />
              {fieldErrors.shippingPhoneNumber ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingPhoneNumber}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10-digit mobile number starting with 6, 7, 8, or 9
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.shippingCompany}
                onChange={(e) =>
                  handleInputChange('shippingCompany', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.shippingStreetLine1}
                onChange={(e) =>
                  handleInputChange('shippingStreetLine1', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingStreetLine1
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.shippingStreetLine1 && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingStreetLine1}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, suite, etc. (Optional)
              </label>
              <input
                type="text"
                value={formData.shippingStreetLine2}
                onChange={(e) =>
                  handleInputChange('shippingStreetLine2', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.shippingCity}
                onChange={(e) =>
                  handleInputChange('shippingCity', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingCity
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.shippingCity && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingCity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <select
                value={formData.shippingProvince}
                onChange={(e) =>
                  handleInputChange('shippingProvince', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingProvince
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {indiaStates.map((state: any) => (
                  <option key={state.code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
              {fieldErrors.shippingProvince && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingProvince}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.shippingPostalCode}
                onChange={(e) =>
                  handleInputChange('shippingPostalCode', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.shippingPostalCode
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {fieldErrors.shippingPostalCode && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.shippingPostalCode}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={formData.shippingCountryCode}
                onChange={(e) =>
                  handleInputChange('shippingCountryCode', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Country</option>
                {countries?.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCardIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Billing Address
            </h2>
            {areDefaultAddressesSame && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Using Default Address
              </span>
            )}
            {defaultBillingAddress &&
              !sameAsShipping &&
              !areDefaultAddressesSame && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Using Default Address
                </span>
              )}
          </div>

          {/* Same as shipping checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sameAsShipping}
                onChange={(e) => toggleBillingAddress(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {areDefaultAddressesSame
                  ? 'Use shipping address as billing address (same by default)'
                  : 'Use shipping address as billing address'}
              </span>
            </label>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
              sameAsShipping ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.billingFullName}
                onChange={(e) =>
                  handleInputChange('billingFullName', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingFullName
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              />
              {fieldErrors.billingFullName && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingFullName}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.billingCompany}
                onChange={(e) =>
                  handleInputChange('billingCompany', e.target.value)
                }
                disabled={sameAsShipping}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address {areDefaultAddressesSame ? '(Optional)' : '*'}
              </label>
              <input
                type="email"
                value={formData.billingEmailAddress}
                onChange={(e) =>
                  handleInputChange('billingEmailAddress', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingEmailAddress
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="example@email.com"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                required={!areDefaultAddressesSame}
              />
              {fieldErrors.billingEmailAddress ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingEmailAddress}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {areDefaultAddressesSame
                    ? 'Optional - will use shipping email if not provided'
                    : 'Enter a valid email address'}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.billingPhoneNumber}
                onChange={(e) =>
                  handleInputChange('billingPhoneNumber', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingPhoneNumber
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                placeholder="9876543210"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                required
              />
              {fieldErrors.billingPhoneNumber ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingPhoneNumber}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10-digit mobile number starting with 6, 7, 8, or 9
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.billingStreetLine1}
                onChange={(e) =>
                  handleInputChange('billingStreetLine1', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingStreetLine1
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              />
              {fieldErrors.billingStreetLine1 && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingStreetLine1}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, suite, etc. (Optional)
              </label>
              <input
                type="text"
                value={formData.billingStreetLine2}
                onChange={(e) =>
                  handleInputChange('billingStreetLine2', e.target.value)
                }
                disabled={sameAsShipping}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.billingCity}
                onChange={(e) =>
                  handleInputChange('billingCity', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingCity ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {fieldErrors.billingCity && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingCity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <select
                value={formData.billingProvince}
                onChange={(e) =>
                  handleInputChange('billingProvince', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingProvince
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                {indiaStates.map((state: any) => (
                  <option key={state.code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
              {fieldErrors.billingProvince && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingProvince}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.billingPostalCode}
                onChange={(e) =>
                  handleInputChange('billingPostalCode', e.target.value)
                }
                disabled={sameAsShipping}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.billingPostalCode
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
              />
              {fieldErrors.billingPostalCode && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.billingPostalCode}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={formData.billingCountryCode}
                onChange={(e) =>
                  handleInputChange('billingCountryCode', e.target.value)
                }
                disabled={sameAsShipping}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Country</option>
                {countries?.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCardIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Method
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Method *
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => selectPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  fieldErrors.paymentMethod
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              >
                <option value="">Choose payment method</option>
                <option value="online">Online Payment</option>
              </select>
              {fieldErrors.paymentMethod && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.paymentMethod}
                </p>
              )}
            </div>

            {/* Payment Method Description */}
            {selectedPaymentMethod === 'online' && (
              <div className="mt-4 p-4 bg-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <InfoIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-indigo-900">
                      Online Payment
                    </h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      Pay securely online using credit/debit cards, net banking,
                      UPI, or digital wallets. Your payment will be processed
                      securely and you'll receive instant confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMethod === 'cod' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TruckIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Cash on Delivery
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Pay in cash when your order is delivered. No advance
                      payment required. Please keep exact change ready for the
                      delivery person.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            {/* Save Details Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.saveDetails}
                onChange={(e) =>
                  handleInputChange('saveDetails', e.target.checked)
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Save my details for future purchases
              </span>
            </label>

            {/* Accept Policies Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptPolicies}
                  onChange={(e) =>
                    handleInputChange('acceptPolicies', e.target.checked)
                  }
                  className={`w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5 ${
                    fieldErrors.acceptPolicies ? 'border-red-300' : ''
                  }`}
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a
                    href="/policy/privacy-and-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Terms of Service and Privacy Policy
                  </a>{' '}
                  *
                </span>
              </label>
              {fieldErrors.acceptPolicies && (
                <p className="text-xs text-red-600 mt-1 ml-7">
                  {fieldErrors.acceptPolicies}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h3>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* {item.image && (
                <img 
                    src={item.image}
                    alt={item.productName}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                )} */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.totalPrice, cart.currency, false)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {formatPrice(
                  cart.subtotal + (offerAmountDetail?.totalDiscount || 0),
                  cart.currency,
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
                      cart.currency,
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
                    cart.currency,
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">Included</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                {formatPrice(cart.total, cart.currency)}
              </span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {cart?.couponCodes && cart.couponCodes.length > 0
                ? 'Coupon Code Applied'
                : 'Have a coupon code?'}
            </label>
            {cart?.couponCodes && cart.couponCodes.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {cart.couponCodes.map((code: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded group"
                  >
                    <CheckIcon className="w-3 h-3" />
                    {code}
                    <button
                      type="button"
                      onClick={() => handleRemoveCoupon(code)}
                      disabled={removeCouponFetcher.state === 'submitting'}
                      className="ml-1 p-0.5 rounded hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Remove coupon code ${code}`}
                    >
                      <X className="w-3 h-3 text-green-700" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter coupon code"
                disabled={
                  couponFetcher.state === 'submitting' ||
                  removeCouponFetcher.state === 'submitting'
                }
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={
                  couponFetcher.state === 'submitting' ||
                  !couponCode.trim() ||
                  (cart?.couponCodes && cart.couponCodes.includes(couponCode))
                }
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-blue-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {couponFetcher.state === 'submitting' ? 'Applying...' : 'Apply'}
              </button>
            </form>
            {couponError && (
              <p className="mt-2 text-xs text-red-600">{couponError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={submitOrder}
            disabled={fetcher.state === 'submitting'}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LockIcon className="w-4 h-4" />
            {fetcher.state === 'submitting'
              ? 'Processing...'
              : 'Complete Order'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            <ShieldCheckIcon className="w-3 h-3 inline mr-1" />
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
