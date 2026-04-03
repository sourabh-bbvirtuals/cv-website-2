import { useState, useEffect, useCallback } from 'react';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import Layout from '~/components/Layout';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';
import { Loader2, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

const ACTIVE_ORDER_QUERY = `
  query {
    activeOrder {
      id
      code
      state
      totalQuantity
      subTotalWithTax
      totalWithTax
      currencyCode
      discounts { amount description }
      lines {
        id
        quantity
        unitPriceWithTax
        linePriceWithTax
        productVariant {
          id name sku
          product { id name slug featuredAsset { preview } }
        }
      }
    }
  }
`;

const CUSTOMER_QUERY = `
  query { activeCustomer { id firstName lastName emailAddress phoneNumber } }
`;

const ELIGIBLE_SHIPPING_QUERY = `
  query { eligibleShippingMethods { id name priceWithTax } }
`;

const REMOVE_LINE_MUTATION = `
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ... on Order { id totalQuantity }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const SET_SHIPPING_ADDRESS = `
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const SET_BILLING_ADDRESS = `
  mutation SetBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const SET_SHIPPING_METHOD = `
  mutation SetShippingMethod($id: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $id) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const TRANSITION_ORDER = `
  mutation TransitionOrder($state: String!) {
    transitionOrderToState(state: $state) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
      ... on OrderStateTransitionError { errorCode message transitionError fromState toState }
    }
  }
`;

const SET_CUSTOMER_FOR_ORDER = `
  mutation SetCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ... on Order { id code state }
      ... on AlreadyLoggedInError { errorCode message }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const NEXT_STATES_QUERY = `query { nextOrderStates }`;

const ADD_PAYMENT = `
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        id code state
        payments { id state method amount metadata customFields }
      }
      ... on ErrorResult { errorCode message }
      ... on PaymentFailedError { errorCode message paymentErrorMessage }
    }
  }
`;

async function gqlFetch(
  query: string,
  variables: Record<string, any> | undefined,
  authToken: string | undefined,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const newToken = res.headers.get('vendure-auth-token');
  const body = await res.json();
  return { body, newToken };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  let authToken: string | undefined = session.get('authToken');

  try {
    const [orderRes, customerRes, shippingRes] = await Promise.all([
      gqlFetch(ACTIVE_ORDER_QUERY, undefined, authToken),
      gqlFetch(CUSTOMER_QUERY, undefined, authToken),
      gqlFetch(ELIGIBLE_SHIPPING_QUERY, undefined, authToken),
    ]);

    for (const r of [orderRes, customerRes, shippingRes]) {
      if (r.newToken) {
        authToken = r.newToken;
        session.set('authToken', r.newToken);
      }
    }

    const activeOrder = orderRes.body?.data?.activeOrder || null;
    const customer = customerRes.body?.data?.activeCustomer || null;
    const shippingMethods =
      shippingRes.body?.data?.eligibleShippingMethods || [];

    return json(
      { activeOrder, customer, shippingMethods, error: null },
      {
        headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
      },
    );
  } catch (err: any) {
    console.error('Cart loader error:', err);
    return json({
      activeOrder: null,
      customer: null,
      shippingMethods: [],
      error: err.message,
    });
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const body = await request.formData();
  const formAction = body.get('_action')?.toString();

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  let authToken: string | undefined = session.get('authToken');

  const commit = async () => ({
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  });

  const updateToken = (newToken: string | null) => {
    if (newToken) {
      authToken = newToken;
      session.set('authToken', newToken);
    }
  };

  if (formAction === 'removeItem') {
    const lineId = body.get('lineId')?.toString();
    if (!lineId) return json({ error: 'Missing lineId' });
    const { body: res, newToken } = await gqlFetch(
      REMOVE_LINE_MUTATION,
      { orderLineId: lineId },
      authToken,
    );
    updateToken(newToken);
    return json({ ok: true }, await commit());
  }

  if (formAction === 'buyNow') {
    const fullName = body.get('fullName')?.toString() || '';
    const email = body.get('email')?.toString() || '';
    const phone = body.get('phone')?.toString() || '';
    const streetLine1 = body.get('streetLine1')?.toString() || '';
    const city = body.get('city')?.toString() || '';
    const province = body.get('province')?.toString() || '';
    const postalCode = body.get('postalCode')?.toString() || '';
    const countryCode = body.get('countryCode')?.toString() || 'IN';

    const addressInput = {
      fullName,
      streetLine1,
      city,
      province,
      postalCode,
      countryCode,
      phoneNumber: phone,
    };

    try {
      // 1. Set shipping address
      console.log('[BuyNow] Setting shipping address…');
      const ship = await gqlFetch(
        SET_SHIPPING_ADDRESS,
        { input: addressInput },
        authToken,
      );
      updateToken(ship.newToken);
      if (ship.body?.errors?.length) {
        console.error('[BuyNow] Shipping address errors:', ship.body.errors);
        return json(
          {
            error:
              ship.body.errors[0]?.message || 'Failed to set shipping address',
          },
          await commit(),
        );
      }
      const shipResult = ship.body?.data?.setOrderShippingAddress;
      if (shipResult?.errorCode) {
        return json(
          { error: `Shipping: ${shipResult.message}` },
          await commit(),
        );
      }

      // 1b. Set customer for order (handles guest checkout; silently ignored if already logged in)
      console.log('[BuyNow] Setting customer for order…');
      const custInput = {
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        emailAddress: email,
        phoneNumber: phone,
      };
      const custRes = await gqlFetch(
        SET_CUSTOMER_FOR_ORDER,
        { input: custInput },
        authToken,
      );
      updateToken(custRes.newToken);
      const custResult = custRes.body?.data?.setCustomerForOrder;
      if (
        custResult?.errorCode &&
        custResult.errorCode !== 'ALREADY_LOGGED_IN_ERROR'
      ) {
        console.error('[BuyNow] Set customer error:', custResult);
        return json(
          { error: `Customer: ${custResult.message}` },
          await commit(),
        );
      }
      console.log('[BuyNow] Customer set (or already logged in)');

      // 2. Set billing address (same as shipping)
      console.log('[BuyNow] Setting billing address…');
      const bill = await gqlFetch(
        SET_BILLING_ADDRESS,
        { input: addressInput },
        authToken,
      );
      updateToken(bill.newToken);

      // 3. Set shipping method (first available)
      console.log('[BuyNow] Fetching eligible shipping methods…');
      const smRes = await gqlFetch(
        ELIGIBLE_SHIPPING_QUERY,
        undefined,
        authToken,
      );
      updateToken(smRes.newToken);
      const methods = smRes.body?.data?.eligibleShippingMethods || [];
      console.log(
        '[BuyNow] Available shipping methods:',
        methods.map((m: any) => `${m.id}:${m.name}`),
      );

      if (methods.length > 0) {
        console.log('[BuyNow] Setting shipping method:', methods[0].id);
        const sm = await gqlFetch(
          SET_SHIPPING_METHOD,
          { id: [methods[0].id] },
          authToken,
        );
        updateToken(sm.newToken);
        if (sm.body?.errors?.length) {
          console.error('[BuyNow] Shipping method errors:', sm.body.errors);
          return json(
            {
              error:
                sm.body.errors[0]?.message || 'Failed to set shipping method',
            },
            await commit(),
          );
        }
        const smResult = sm.body?.data?.setOrderShippingMethod;
        if (smResult?.errorCode) {
          return json(
            { error: `Shipping method: ${smResult.message}` },
            await commit(),
          );
        }
        console.log('[BuyNow] Shipping method set successfully');
      } else {
        console.warn('[BuyNow] No eligible shipping methods found');
      }

      // 4. Transition to ArrangingPayment
      console.log('[BuyNow] Checking next order states…');
      const ns = await gqlFetch(NEXT_STATES_QUERY, undefined, authToken);
      updateToken(ns.newToken);
      const nextStates: string[] = ns.body?.data?.nextOrderStates || [];
      console.log('[BuyNow] Next states:', nextStates);

      if (nextStates.includes('ArrangingPayment')) {
        console.log('[BuyNow] Transitioning to ArrangingPayment…');
        const tr = await gqlFetch(
          TRANSITION_ORDER,
          { state: 'ArrangingPayment' },
          authToken,
        );
        updateToken(tr.newToken);
        if (tr.body?.errors?.length) {
          console.error('[BuyNow] Transition errors:', tr.body.errors);
          return json(
            {
              error: tr.body.errors[0]?.message || 'Failed to transition order',
            },
            await commit(),
          );
        }
        const trResult = tr.body?.data?.transitionOrderToState;
        if (trResult?.errorCode) {
          return json(
            {
              error: `Transition: ${
                trResult.message || trResult.transitionError
              }`,
            },
            await commit(),
          );
        }
        console.log('[BuyNow] Transitioned to ArrangingPayment');
      } else {
        console.log(
          '[BuyNow] ArrangingPayment not in next states, current states:',
          nextStates,
        );
      }

      // 5. Add Easebuzz payment
      const orderRes = await gqlFetch(ACTIVE_ORDER_QUERY, undefined, authToken);
      updateToken(orderRes.newToken);
      const order = orderRes.body?.data?.activeOrder;

      const paymentInput = {
        method: 'easebuzz',
        metadata: {
          orderId: order?.code,
          amount: order?.totalWithTax,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          productInfo: `Order ${order?.code}`,
        },
      };

      const pay = await gqlFetch(
        ADD_PAYMENT,
        { input: paymentInput },
        authToken,
      );
      updateToken(pay.newToken);
      const payResult = pay.body?.data?.addPaymentToOrder;

      if (payResult?.errorCode || payResult?.paymentErrorMessage) {
        const errMsg =
          payResult.paymentErrorMessage ||
          payResult.message ||
          'Payment failed';
        return json({ error: errMsg }, await commit());
      }

      if (payResult?.payments?.length) {
        const payment = payResult.payments.find(
          (p: any) => p.method === 'easebuzz' && p.state === 'Authorized',
        );
        const paymentUrl = payment?.customFields?.paymentPageUrl;
        if (paymentUrl) {
          return json(
            { redirectUrl: paymentUrl, orderCode: payResult.code },
            await commit(),
          );
        }
      }

      return json(
        {
          redirectUrl: `/checkout2/confirmation/${
            payResult?.code || 'unknown'
          }?status=success`,
          orderCode: payResult?.code,
        },
        await commit(),
      );
    } catch (err: any) {
      console.error('Buy now error:', err);
      return json(
        { error: err.message || 'Something went wrong' },
        await commit(),
      );
    }
  }

  return json({ error: 'Unknown action' });
}

function formatPrice(amountInCents: number): string {
  const rupees = amountInCents / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.6673 7.58294C11.6673 10.4996 9.62565 11.9579 7.19898 12.8038C7.07191 12.8468 6.93388 12.8448 6.80815 12.7979C4.37565 11.9579 2.33398 10.4996 2.33398 7.58294V3.49961C2.33398 3.3449 2.39544 3.19653 2.50484 3.08713C2.61424 2.97774 2.76261 2.91628 2.91732 2.91628C4.08398 2.91628 5.54232 2.21628 6.55732 1.32961C6.6809 1.22403 6.83811 1.16602 7.00065 1.16602C7.16319 1.16602 7.3204 1.22403 7.44398 1.32961C8.46482 2.22211 9.91732 2.91628 11.084 2.91628C11.2387 2.91628 11.3871 2.97774 11.4965 3.08713C11.6059 3.19653 11.6673 3.3449 11.6673 3.49961V7.58294Z"
      stroke="#1A7F37"
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 7.00065L6.41667 8.16732L8.75 5.83398"
      stroke="#1A7F37"
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CartPage() {
  const { activeOrder, customer, shippingMethods } =
    useLoaderData<typeof loader>();
  const removeFetcher = useFetcher();
  const buyFetcher = useFetcher();

  const lines = activeOrder?.lines || [];
  const isEmpty = lines.length === 0;
  const subtotal = activeOrder?.subTotalWithTax ?? 0;
  const total = activeOrder?.totalWithTax ?? 0;
  const discountTotal = (activeOrder?.discounts || []).reduce(
    (sum: number, d: any) => sum + Math.abs(d.amount),
    0,
  );

  const [fullName, setFullName] = useState(
    customer
      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
      : '',
  );
  const [email, setEmail] = useState(customer?.emailAddress || '');
  const [phone, setPhone] = useState(customer?.phoneNumber || '');
  const [streetLine1, setStreetLine1] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [formError, setFormError] = useState('');

  const isSubmitting = buyFetcher.state !== 'idle';
  const buyData = buyFetcher.data as any;

  useEffect(() => {
    if (buyFetcher.state === 'idle' && buyData) {
      if (buyData.redirectUrl) {
        window.location.href = buyData.redirectUrl;
      } else if (buyData.error) {
        setFormError(buyData.error);
      }
    }
  }, [buyFetcher.state, buyData]);

  const handleRemove = (lineId: string) => {
    removeFetcher.submit({ _action: 'removeItem', lineId }, { method: 'post' });
  };

  const handleBuyNow = useCallback(() => {
    setFormError('');
    if (!fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!phone.trim()) {
      setFormError('Phone number is required');
      return;
    }
    if (!streetLine1.trim()) {
      setFormError('Address is required');
      return;
    }
    if (!city.trim()) {
      setFormError('City is required');
      return;
    }
    if (!postalCode.trim()) {
      setFormError('Postal code is required');
      return;
    }

    buyFetcher.submit(
      {
        _action: 'buyNow',
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        streetLine1: streetLine1.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        countryCode: 'IN',
      },
      { method: 'post' },
    );
  }, [
    fullName,
    email,
    phone,
    streetLine1,
    city,
    province,
    postalCode,
    buyFetcher,
  ]);

  return (
    <Layout>
      <div className="pb-8 sm:pb-12 lg:pb-28">
        <div className="pb-6 md:pb-10 4xl:pb-15! h-62.5 md:h-75 lg:h-84 xl:h-100 bg-[#FFF8F9] border-b border-[#0816271A] flex items-end">
          <div className="custom-container">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] leading-[120%] font-bold text-lightgray">
              Your Cart
            </h1>
          </div>
        </div>
        <div className="custom-container relative z-10 top-0 mt-4 sm:mt-6 lg:mt-8 4xl:mt-16!">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingCart className="size-16 text-slate-300 mb-6" />
              <h2 className="text-2xl font-bold text-lightgray mb-2">
                Your cart is empty
              </h2>
              <p className="text-slate-500 mb-8">
                Browse our courses and add something you like!
              </p>
              <Link
                to="/our-courses"
                className="px-8 py-3.5 bg-[#3A6BFC] text-white rounded-full font-semibold hover:bg-blue-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-3 xl:gap-5 relative">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Cart Items */}
                <div className="bg-white rounded-lg sm:rounded-3xl border border-[#0816271A] shadow-[0px_4px_8px_0px_#00000008,0px_15px_15px_0px_#00000005,0px_33px_20px_0px_#00000003,0px_59px_24px_0px_#00000000,0px_92px_26px_0px_#00000000] p-3 sm:p-4 xl:p-9">
                  <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-lightgray mb-4 sm:mb-5 xl:mb-7.5 pb-4 sm:pb-5 xl:pb-7.5 border-b border-[#0816271A]">
                    Products ({activeOrder?.totalQuantity ?? 0})
                  </h2>
                  <div className="space-y-4 xl:space-y-7.5">
                    {lines.map((line: any) => {
                      const product = line.productVariant?.product;
                      const isRemoving =
                        removeFetcher.state !== 'idle' &&
                        removeFetcher.formData?.get('lineId') === line.id;
                      return (
                        <div
                          key={line.id}
                          className={`flex gap-3 sm:gap-4 items-start justify-between pb-4 sm:pb-6 xl:pb-9 border-b border-[#0816271A] last:border-0 last:pb-0 ${
                            isRemoving ? 'opacity-40' : ''
                          }`}
                        >
                          <div className="flex gap-3 sm:gap-5 items-center min-w-0">
                            <Link
                              to={`/our-courses/${product?.slug || ''}`}
                              className="w-16 sm:w-20 h-10 sm:h-13 bg-gray-100 rounded-lg overflow-hidden shrink-0"
                            >
                              {product?.featuredAsset?.preview ? (
                                <img
                                  src={`${product.featuredAsset.preview}?w=160&h=104`}
                                  alt={product?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                                  No img
                                </div>
                              )}
                            </Link>
                            <div className="min-w-0">
                              <Link
                                to={`/our-courses/${product?.slug || ''}`}
                                className="text-base lg:text-lg xl:text-xl leading-[120%] text-lightgray font-medium line-clamp-1 hover:text-[#3A6BFC] transition-colors"
                              >
                                {product?.name || line.productVariant?.name}
                              </Link>
                              <p className="text-xs sm:text-sm xl:text-base mt-1 sm:mt-2 xl:mt-3 text-lightgray opacity-50 font-medium leading-[120%]">
                                {line.productVariant?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-base sm:text-lg xl:text-xl text-lightgray font-bold">
                              {formatPrice(line.linePriceWithTax)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemove(line.id)}
                              disabled={isRemoving}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              {isRemoving ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Billing Information */}
                <div className="bg-white rounded-lg sm:rounded-3xl border border-[#0816271A] shadow-[0px_4px_8px_0px_#00000008,0px_15px_15px_0px_#00000005,0px_33px_20px_0px_#00000003,0px_59px_24px_0px_#00000000,0px_92px_26px_0px_#00000000] p-3 sm:p-4 xl:p-9">
                  <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-lightgray mb-4 sm:mb-5 xl:mb-7.5 pb-4 sm:pb-5 xl:pb-7.5 border-b border-[#0816271A]">
                    Billing Information
                  </h2>

                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
                      <AlertCircle className="size-4 mt-0.5 shrink-0" />
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value.replace(/\D/g, '').slice(0, 10),
                          )
                        }
                        placeholder="9876543210"
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={streetLine1}
                        onChange={(e) => setStreetLine1(e.target.value)}
                        placeholder="Street address"
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="400001"
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base focus:outline-none focus:ring-2 focus:ring-[#3A6BFC]/30 focus:border-[#3A6BFC] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightgray opacity-60 mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value="India"
                        disabled
                        className="w-full h-11 xl:h-12 px-4 rounded-xl border border-[#0816271A] text-lightgray text-sm xl:text-base bg-slate-50 opacity-70"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Summary */}
              <div className="lg:col-span-1 h-max">
                <div className="sticky top-0 flex flex-col gap-4 xl:gap-5">
                  <div className="bg-white rounded-xl sm:rounded-3xl border border-[#0816271A] shadow-[0px_4px_8px_0px_#00000008,0px_15px_15px_0px_#00000005,0px_33px_20px_0px_#00000003,0px_59px_24px_0px_#00000000,0px_92px_26px_0px_#00000000] p-3 sm:p-4 xl:p-9">
                    <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-lightgray mb-4 sm:mb-5 xl:mb-7.5">
                      Summary
                    </h2>
                    <div className="border-t border-[#0816271A] my-5 xl:my-6"></div>
                    <div className="space-y-3 xl:space-y-6">
                      <div className="flex justify-between items-center text-sm sm:text-base lg:text-lg xl:text-xl leading-[120%] font-medium">
                        <span className="text-lightgray opacity-50">
                          Subtotal
                        </span>
                        <span className="text-lightgray">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      {discountTotal > 0 && (
                        <div className="flex justify-between items-center text-sm sm:text-base lg:text-lg xl:text-xl leading-[120%] font-medium">
                          <span className="text-lightgray opacity-50">
                            Savings
                          </span>
                          <span className="text-[#1A7F37]">
                            -{formatPrice(discountTotal)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-[#0816271A] my-5 xl:my-6"></div>
                    <div className="flex justify-between items-start">
                      <span className="text-base sm:text-lg xl:text-xl text-lightgray font-semibold">
                        Total
                      </span>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl xl:text-[28px] font-bold text-lightgray leading-tight">
                          {formatPrice(total)}
                        </div>
                        <div className="text-[10px] xl:text-xs text-lightgray opacity-40 mt-1 font-medium">
                          Inclusive of all taxes
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isSubmitting}
                    className="w-full bg-[#3A6BFC] text-white py-3.5 xl:py-4 rounded-full text-base xl:text-xl font-semibold hover:bg-blue-700 transition shadow-[0px_4px_8px_0px_#00000008,0px_15px_15px_0px_#00000005,0px_33px_20px_0px_#00000003,0px_59px_24px_0px_#00000000,0px_92px_26px_0px_#00000000] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <Loader2 className="size-5 animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      'Buy Now'
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-lightgray opacity-50 font-medium">
                    <ShieldIcon />
                    <span>256-bit SSL Encrypted &bull; Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
