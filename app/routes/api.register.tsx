import { json, type DataFunctionArgs } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

const REGISTER_CUSTOMER_MUTATION = `
  mutation RegisterCustomerAccount($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// Removed LOGIN_MUTATION - we don't need login for guest enrollment
// Customer is created during registration and order is linked by email

export async function action({ request }: DataFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.formData();
  const fullName = body.get('fullName')?.toString();
  const email = body.get('email')?.toString();
  const phone = body.get('phone')?.toString();
  const password = body.get('password')?.toString() || 'temp-' + Date.now(); // Generate temp password

  if (!fullName || !email) {
    return json(
      { error: 'Missing fullName or email', success: false },
      { status: 400 },
    );
  }

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );

  // Split name into firstName and lastName
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    console.log('[api.register] Registering customer:', {
      email,
      firstName,
      lastName,
      phone,
    });

    // Step 1: Register the customer account in Vendure
    const registerRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: REGISTER_CUSTOMER_MUTATION,
        variables: {
          input: {
            firstName,
            lastName,
            emailAddress: email,
            phoneNumber: phone || '',
            password,
          },
        },
      }),
    });

    const registerResult = await registerRes.json();

    // Check for GraphQL errors
    if (registerResult.errors && registerResult.errors.length > 0) {
      console.error(
        '[api.register] GraphQL error during registration:',
        registerResult.errors[0],
      );
      return json(
        {
          error: registerResult.errors[0]?.message || 'Registration failed',
          success: false,
        },
        { status: 400 },
      );
    }

    const registerData = registerResult?.data?.registerCustomerAccount;

    if (!registerData || 'errorCode' in registerData) {
      const errorMsg = (registerData as any)?.message || 'Registration failed';
      console.error('[api.register] Registration error:', errorMsg);
      return json({ error: errorMsg, success: false }, { status: 400 });
    }

    console.log('[api.register] Customer registered successfully');
    console.log(
      '[api.register] Skipping login - using guest enrollment by email',
    );

    // Registration complete - customer created but NOT logged in
    // Frontend will use email to link order during enrollment
    // This allows enrollment to proceed without auth token requirement

    return json(
      {
        success: true,
        customer: {
          email,
          firstName,
          lastName,
          phone,
        },
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    );
  } catch (err: any) {
    console.error('[api.register] Error:', err.message);
    return json(
      { error: err.message || 'Server error', success: false },
      { status: 500 },
    );
  }
}
