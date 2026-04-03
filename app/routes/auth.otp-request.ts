import { ActionFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

type RequestOtpResponse = {
  data?: {
    requestOtp?: {
      success: boolean;
      expiresAt?: string;
      errorCode?: string;
      errorMessage?: string;
      retryAfterSeconds?: number;
    };
  };
  errors?: Array<{ message: string }>;
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { method?: string; identifier?: string };
  try {
    body = (await request.json()) as { method?: string; identifier?: string };
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const identifier =
    typeof body.identifier === 'string' ? body.identifier.trim() : '';

  if (!identifier) {
    return json({ error: 'Email is required' }, { status: 400 });
  }

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(identifier.toLowerCase())) {
    return json(
      { error: 'Please enter a valid email address' },
      { status: 400 },
    );
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        mutation RequestOtp($identifier: String!, $method: OtpMethod!) {
          requestOtp(identifier: $identifier, method: $method) {
            success
            expiresAt
            errorCode
            errorMessage
            retryAfterSeconds
          }
        }
      `,
      variables: { identifier, method: 'EMAIL' },
    }),
  });

  const result = (await resp.json().catch(() => ({}))) as RequestOtpResponse;

  if (result.errors?.length) {
    return json(
      { error: result.errors[0].message ?? 'Failed to send OTP' },
      { status: 500 },
    );
  }

  const data = result.data?.requestOtp;
  if (!data) {
    return json({ error: 'Invalid response from server' }, { status: 502 });
  }

  if (!data.success) {
    return json(
      {
        error: data.errorMessage ?? 'Failed to send OTP',
        code: data.errorCode,
        retryAfterSeconds: data.retryAfterSeconds,
      },
      { status: 400 },
    );
  }

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  session.set('otpIdentifier', identifier);
  session.set('otpMethod', 'email');

  return json(
    { ok: true, expiresAt: data.expiresAt },
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
