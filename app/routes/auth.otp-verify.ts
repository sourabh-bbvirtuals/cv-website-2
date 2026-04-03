import { ActionFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

function safeRedirectTo(value: unknown): string {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
  ) {
    return value;
  }
  return '/';
}

type AuthenticateResponse = {
  data?: {
    authenticate?: {
      __typename: string;
      id?: string;
      identifier?: string;
      message?: string;
    };
  };
  errors?: Array<{ message: string }>;
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { otp?: string; redirectTo?: string };
  try {
    body = (await request.json()) as { otp?: string; redirectTo?: string };
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
  const redirectTo = safeRedirectTo(body.redirectTo);

  if (!otp) {
    return json({ error: 'OTP is required' }, { status: 400 });
  }
  if (!/^\d{6}$/.test(otp)) {
    return json({ error: 'Enter a valid 6-digit OTP' }, { status: 400 });
  }

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const identifier = session.get('otpIdentifier');

  if (!identifier || typeof identifier !== 'string') {
    return json(
      {
        error: 'Session expired. Please request a new OTP.',
        code: 'OTP_SESSION',
      },
      { status: 400 },
    );
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  const existingAuthToken = session.get('authToken');
  if (existingAuthToken) {
    headers.append('Authorization', `Bearer ${existingAuthToken}`);
  }

  const vendureResponse = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        mutation AuthenticateOtp($identifier: String!, $otp: String!, $rememberMe: Boolean) {
          authenticate(input: { otp: { identifier: $identifier, otp: $otp } }, rememberMe: $rememberMe) {
            __typename
            ... on CurrentUser {
              id
              identifier
            }
            ... on ErrorResult {
              message
            }
          }
        }
      `,
      variables: { identifier, otp, rememberMe: true },
    }),
  });

  const result = (await vendureResponse
    .json()
    .catch(() => ({}))) as AuthenticateResponse;

  if (result.errors?.length) {
    session.unset('otpIdentifier');
    session.unset('otpMethod');
    return json(
      {
        error: result.errors[0].message ?? 'Authentication failed',
        code: 'AUTH_ERROR',
      },
      {
        status: 500,
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    );
  }

  const authResult = result.data?.authenticate;
  const authToken = vendureResponse.headers.get('vendure-auth-token');
  const isSuccess = authResult?.__typename === 'CurrentUser' && !!authToken;

  if (!isSuccess) {
    const errorMsg =
      authResult && 'message' in authResult
        ? (authResult.message as string)
        : 'Invalid or expired OTP';
    session.unset('otpIdentifier');
    session.unset('otpMethod');
    return json(
      { error: errorMsg, code: 'AUTH_FAILED' },
      {
        status: 401,
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    );
  }

  session.set('authToken', authToken);
  session.unset('otpIdentifier');
  session.unset('otpMethod');

  return json(
    { ok: true as const, redirectTo },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    },
  );
}

export async function loader() {
  return redirect('/sign-in');
}
