import { json, type DataFunctionArgs } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

const ACTIVE_ORDER_QUERY = `
  query ActiveOrderForDuplicateCheck {
    activeOrder {
      lines {
        productVariant { id }
      }
    }
  }
`;

const ADD_TO_ORDER_MUTATION = `
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ... on Order {
        id
        code
        totalQuantity
        totalWithTax
        currencyCode
        lines {
          id
          quantity
          productVariant {
            id
            name
            product { slug }
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on InsufficientStockError {
        errorCode
        message
        quantityAvailable
      }
    }
  }
`;

export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();
  const variantId = body.get('variantId')?.toString();
  const quantity = Number(body.get('quantity')?.toString() ?? 1);

  if (!variantId || !(quantity > 0)) {
    return json(
      { error: 'Missing variantId or invalid quantity', order: null },
      { status: 400 },
    );
  }

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const authToken: string | undefined = session.get('authToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    // ── Duplicate guard: check active order first ──────────────────────────
    const activeOrderRes = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: ACTIVE_ORDER_QUERY }),
    });
    const activeOrderData = await activeOrderRes.json();
    const existingLines: Array<{ productVariant: { id: string } }> =
      activeOrderData?.data?.activeOrder?.lines ?? [];
    const alreadyInCart = existingLines.some(
      (line) => line.productVariant?.id === variantId,
    );
    if (alreadyInCart) {
      return json(
        {
          error: 'This course is already in your cart.',
          order: null,
          already_in_cart: true,
        },
        {
          status: 409,
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        },
      );
    }
    // ── Proceed to add item ────────────────────────────────────────────────
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: ADD_TO_ORDER_MUTATION,
        variables: { productVariantId: variantId, quantity },
      }),
    });

    const vendureAuthToken = res.headers.get('vendure-auth-token');
    if (vendureAuthToken) {
      session.set('authToken', vendureAuthToken);
    }

    const result = await res.json();
    const data = result?.data?.addItemToOrder;

    if (!data) {
      console.error('addItemToOrder returned no data:', result);
      return json(
        { error: 'No response from server', order: null },
        {
          status: 500,
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        },
      );
    }

    if (data.errorCode) {
      return json(
        { error: data.message, order: null },
        {
          status: 400,
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        },
      );
    }

    return json(
      { error: null, order: data },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    );
  } catch (err: any) {
    console.error('Enroll API error:', err);
    return json(
      { error: err.message || 'Server error', order: null },
      { status: 500 },
    );
  }
}
