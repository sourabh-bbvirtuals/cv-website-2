import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { createHash } from 'crypto';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

const TRANSITION_ORDER = `
  mutation TransitionOrder($state: String!) {
    transitionOrderToState(state: $state) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
      ... on OrderStateTransitionError { errorCode message transitionError fromState toState }
    }
  }
`;

const ADD_PAYMENT = `
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order { id code state }
      ... on ErrorResult { errorCode message }
      ... on PaymentFailedError { errorCode message paymentErrorMessage }
    }
  }
`;

const ACTIVE_ORDER_QUERY = `
  query { activeOrder { id code state } }
`;

const ORDER_BY_CODE_QUERY = `
  query OrderByCode($code: String!) {
    orderByCode(code: $code) {
      id
      code
      state
      totalWithTax
      subTotalWithTax
      shippingWithTax
      currencyCode
      couponCodes
      lines {
        quantity
        unitPriceWithTax
        linePriceWithTax
        productVariant {
          id
          name
          sku
          product { id name }
        }
      }
      discounts {
        amount
        amountWithTax
        description
        adjustmentSource
        type
      }
      promotions {
        id
        name
        couponCode
      }
      customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
      }
      shippingAddress {
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country
        phoneNumber
      }
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const status = formData.get('status')?.toString() || '';
  const txnid = formData.get('txnid')?.toString() || '';
  const amount = formData.get('amount')?.toString() || '';
  const productinfo = formData.get('productinfo')?.toString() || '';
  const firstname = formData.get('firstname')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const easepayid = formData.get('easepayid')?.toString() || '';
  const responseHash = formData.get('hash')?.toString() || '';

  console.log('[EasebuzzCallback] Received:', { status, txnid, amount, easepayid });

  const ebSalt = process.env.EASEBUZZ_SALT || '';

  // Verify hash (reverse hash for response verification)
  const reverseHashString = `${ebSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.EASEBUZZ_KEY || ''}`;
  const expectedHash = createHash('sha512').update(reverseHashString).digest('hex');
  const hashValid = expectedHash === responseHash;
  console.log('[EasebuzzCallback] Hash valid:', hashValid);

  if (status !== 'success' || !hashValid) {
    console.error('[EasebuzzCallback] Payment failed or hash mismatch');
    return redirect(`/cart?paymentError=${encodeURIComponent('Payment was not successful. Please try again.')}`);
  }

  // Payment succeeded — settle the order via Vendure
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  let authToken: string | undefined = session.get('authToken');
  console.log('[EasebuzzCallback] Auth token present:', !!authToken);
  console.log('[EasebuzzCallback] Cookie header present:', !!request.headers.get('Cookie'));

  try {
    // Check order state — it should be in ArrangingPayment
    const orderRes = await gqlFetch(ACTIVE_ORDER_QUERY, undefined, authToken);
    if (orderRes.newToken) {
      authToken = orderRes.newToken;
      session.set('authToken', orderRes.newToken);
    }
    const activeOrder = orderRes.body?.data?.activeOrder;
    const orderState = activeOrder?.state;
    console.log('[EasebuzzCallback] Order state:', orderState, 'order code:', activeOrder?.code);

    if (orderState !== 'ArrangingPayment') {
      console.log('[EasebuzzCallback] Order not in ArrangingPayment, transitioning...');
      const tr = await gqlFetch(TRANSITION_ORDER, { state: 'ArrangingPayment' }, authToken);
      if (tr.newToken) {
        authToken = tr.newToken;
        session.set('authToken', tr.newToken);
      }
    }

    // Add payment to settle the order
    const pay = await gqlFetch(
      ADD_PAYMENT,
      {
        input: {
          method: 'easebuzz',
          metadata: {
            txnid,
            easepayid,
            amount,
            status,
          },
        },
      },
      authToken,
    );
    if (pay.newToken) {
      authToken = pay.newToken;
      session.set('authToken', pay.newToken);
    }

    const payResult = pay.body?.data?.addPaymentToOrder;
    console.log('[EasebuzzCallback] Payment result:', JSON.stringify(payResult));

    if (payResult?.errorCode) {
      console.error('[EasebuzzCallback] Payment error:', payResult.message);
      return redirect(`/cart?paymentError=${encodeURIComponent(payResult.message || 'Payment settlement failed')}`, {
        headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
      });
    }

    const orderCode = payResult?.code || txnid.replace(/_\d+$/, '');
    console.log('[EasebuzzCallback] Order settled, code:', orderCode, 'state:', payResult?.state);

    // Fire webhook to BB server with order details
    try {
      const orderDetail = await gqlFetch(ORDER_BY_CODE_QUERY, { code: orderCode }, authToken);
      if (orderDetail.newToken) {
        authToken = orderDetail.newToken;
        session.set('authToken', orderDetail.newToken);
      }
      const settled = orderDetail.body?.data?.orderByCode;
      if (settled) {
        const webhookEmail = email || settled.customer?.emailAddress || '';
        const bbServerUrl = process.env.BB_SERVER_URL || 'http://server:3000';
        const webhookSecret = process.env.VENDURE_WEBHOOK_SECRET || 'vendure-webhook-secret';
        const webhookPayload = {
          event: 'PaymentSettled',
          vendureOrderId: settled.id,
          vendureOrderCode: settled.code,
          state: settled.state || 'PaymentSettled',
          totalWithTax: settled.totalWithTax,
          subTotalWithTax: settled.subTotalWithTax,
          shippingWithTax: settled.shippingWithTax,
          currencyCode: settled.currencyCode,
          couponCodes: settled.couponCodes || [],
          lines: (settled.lines || []).map((line: any) => ({
            vendureVariantId: line.productVariant?.id,
            bbvListingId: null,
            quantity: line.quantity,
            unitPrice: line.unitPriceWithTax,
            listPrice: line.unitPriceWithTax,
            linePrice: line.linePriceWithTax,
            productName: line.productVariant?.product?.name || line.productVariant?.name || '',
            sku: line.productVariant?.sku || '',
          })),
          discounts: (settled.discounts || []).map((d: any) => ({
            promotionId: d.adjustmentSource || '',
            description: d.description || '',
            amount: d.amountWithTax ?? d.amount ?? 0,
          })),
          promotions: (settled.promotions || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            couponCode: p.couponCode,
          })),
          customer: settled.customer ? {
            email: webhookEmail,
            firstName: settled.customer.firstName || '',
            lastName: settled.customer.lastName || '',
            phone: settled.customer.phoneNumber || '',
          } : { email: webhookEmail, firstName: firstname, lastName: '', phone: '' },
          shippingAddress: settled.shippingAddress || {
            fullName: firstname,
            streetLine1: '',
            streetLine2: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'IN',
            phoneNumber: '',
          },
        };

        console.log('[EasebuzzCallback] Sending webhook to BB server for order:', orderCode);
        const whRes = await fetch(`${bbServerUrl}/webhooks/vendure/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret,
          },
          body: JSON.stringify(webhookPayload),
        });
        console.log('[EasebuzzCallback] BB server webhook response:', whRes.status, await whRes.text());
      } else {
        console.warn('[EasebuzzCallback] Could not fetch order details for webhook, code:', orderCode);
      }
    } catch (whErr: any) {
      console.error('[EasebuzzCallback] BB server webhook failed:', whErr.message);
    }

    return redirect(`/checkout2/confirmation/${orderCode}?status=success`, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    });
  } catch (err: any) {
    console.error('[EasebuzzCallback] Error:', err.message);
    return redirect(`/cart?paymentError=${encodeURIComponent('Something went wrong processing your payment.')}`, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    });
  }
}
