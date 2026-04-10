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

    const orderCode = payResult?.code || txnid.split('_')[0];
    console.log('[EasebuzzCallback] Order settled:', orderCode);

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
