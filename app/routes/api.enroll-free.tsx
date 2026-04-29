import { json, type DataFunctionArgs } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

const ENROLL_FREE_PRODUCT_MUTATION = `
  mutation EnrollFreeProduct($productVariantId: ID!, $quantity: Int!, $customerEmail: String) {
    enrollFreeProduct(input: {
      productVariantId: $productVariantId
      quantity: $quantity
      customerEmail: $customerEmail
    }) {
      id
      code
      state
      totalWithTax
      currencyCode
      customer {
        id
        emailAddress
        firstName
        lastName
      }
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
  }
`;

export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();
  const variantId = body.get('variantId')?.toString();
  const quantity = Number(body.get('quantity')?.toString() ?? 1);
  const customerEmail = body.get('customerEmail')?.toString(); // For guest enrollment

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

  // Support both authenticated and guest (email-based) enrollment
  if (!authToken && !customerEmail) {
    return json(
      {
        error:
          'User must be authenticated or provide email for free enrollment',
        order: null,
      },
      { status: 401 },
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add auth token if user is authenticated AND not doing guest enrollment
  // Guest enrollment uses email, not auth token
  if (authToken && !customerEmail) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    console.log('API_URL:', API_URL);
    console.log(
      '[api.enroll-free] Requesting free enrollment',
      authToken ? 'with auth token' : 'as guest with email',
      'variantId:',
      variantId,
      'quantity:',
      quantity,
    );

    const variables: Record<string, any> = {
      productVariantId: variantId,
      quantity,
    };
    // Add email for guest enrollment
    // If customerEmail is provided, it's explicitly a guest enrollment request
    // (Don't check authToken - it's cached and unreliable)
    if (customerEmail) {
      variables.customerEmail = customerEmail;
    }

    console.log('[api.enroll-free] Mutation variables:', variables);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: ENROLL_FREE_PRODUCT_MUTATION,
        variables,
      }),
    });

    const vendureAuthToken = res.headers.get('vendure-auth-token');
    if (vendureAuthToken) {
      session.set('authToken', vendureAuthToken);
    }

    const result = await res.json();

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMsg = result.errors[0]?.message || 'GraphQL error';
      console.error('enrollFreeProduct GraphQL error:', errorMsg);
      return json(
        { error: errorMsg, order: null },
        {
          status: 400,
          headers: {
            'Set-Cookie': await sessionStorage.commitSession(session),
          },
        },
      );
    }

    const data = result?.data?.enrollFreeProduct;

    if (!data) {
      console.error('enrollFreeProduct returned no data:', result);
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

    // ✅ Free enrollment successful
    // Order is ALREADY in PaymentSettled state
    // Emails & webhooks triggered automatically by backend
    return json(
      { error: null, order: data, enrolled: true },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    );
  } catch (err: any) {
    console.error('Free enroll API error:', err);
    return json(
      { error: err.message || 'Server error', order: null },
      { status: 500 },
    );
  }
}
