import { redirect, type DataFunctionArgs } from '@remix-run/server-runtime';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

function getGoogleRedirectUri(request: Request): string {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${new URL(request.url).origin}/auth/google/callback`
  );
}

type GoogleTokenResponse = {
  id_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
};

type AuthenticateResponse = {
  data?: {
    authenticate?: {
      __typename: string;
      message?: string;
    };
  };
  errors?: Array<{ message: string }>;
};

export async function loader({ request }: DataFunctionArgs) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirect('/sign-in?error=google_not_configured');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const expectedState = session.get('google_oauth_state');
  const redirectTo = session.get('google_oauth_redirect_to') || '/account';
  session.unset('google_oauth_state');
  session.unset('google_oauth_redirect_to');

  console.log('[Google Auth] State check:', {
    stateFromUrl: state,
    expectedState,
    cookieHeader: request.headers.get('Cookie')?.substring(0, 80),
    match: state === expectedState,
  });

  if (!code || !state || !expectedState || state !== expectedState) {
    console.error('[Google Auth] State validation FAILED:', {
      hasCode: !!code,
      hasState: !!state,
      hasExpectedState: !!expectedState,
      statesMatch: state === expectedState,
    });
    return redirect('/sign-in?error=google_state_invalid', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(request),
      grant_type: 'authorization_code',
    }),
  });
  const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;
  const idToken = tokenJson.id_token;
  if (!idToken) {
    return redirect('/sign-in?error=google_token_failed', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  const existingAuthToken = session.get('authToken');
  if (existingAuthToken) {
    headers.append('Authorization', `Bearer ${existingAuthToken}`);
  }

  const vendureResponse = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        mutation AuthenticateWithGoogle($idToken: String!, $rememberMe: Boolean) {
          authenticate(input: { google: { idToken: $idToken } }, rememberMe: $rememberMe) {
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
      variables: {
        idToken,
        rememberMe: true,
      },
    }),
  });

  const vendureJson = (await vendureResponse.json()) as AuthenticateResponse;
  const authToken = vendureResponse.headers.get('vendure-auth-token');
  const authResult = vendureJson.data?.authenticate;
  const authOk = authResult?.__typename === 'CurrentUser' && !!authToken;

  console.log('[Google Auth] Vendure API URL:', API_URL);
  console.log('[Google Auth] Vendure response status:', vendureResponse.status);
  console.log(
    '[Google Auth] Vendure auth result:',
    JSON.stringify(vendureJson),
  );
  console.log('[Google Auth] Vendure auth token present:', !!authToken);
  console.log('[Google Auth] Auth OK:', authOk);

  if (!authOk) {
    return redirect('/sign-in?error=google_auth_failed', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  session.set('authToken', authToken);
  const setCookieValue = await sessionStorage.commitSession(session);
  console.log('[Google Auth] Redirect to:', redirectTo);
  console.log('[Google Auth] Set-Cookie length:', setCookieValue.length);
  console.log('[Google Auth] Auth token length:', authToken?.length);

  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/account';
  const origin = new URL(request.url).origin;
  const absoluteUrl = `${origin}${safeRedirect}`;

  const html = `<!DOCTYPE html>
<html><head>
<meta http-equiv="refresh" content="0;url=${absoluteUrl}">
<script>window.location.replace(${JSON.stringify(absoluteUrl)});</script>
</head><body>Redirecting…</body></html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': setCookieValue,
    },
  });
}
