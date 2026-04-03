import { json } from '@remix-run/node';
import { applyCouponCode } from '~/providers/orders/order';
import { getSessionStorage } from '~/sessions';
import { ErrorResult } from '~/generated/graphql';

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const couponCode = formData.get('couponCode') as string;

  if (!couponCode) {
    return json({ error: 'Coupon code is required' }, { status: 400 });
  }

  try {
    const sessionStorage = await getSessionStorage();
    const session = await sessionStorage.getSession(
      request.headers.get('Cookie')
    );

    const result = await applyCouponCode(couponCode, { request });
    const couponResult = result.applyCouponCode;

    if ('errorCode' in couponResult) {
      return json({ error: (couponResult as ErrorResult).message }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    return json(
      { error: 'Failed to apply coupon code' },
      { status: 500 }
    );
  }
} 