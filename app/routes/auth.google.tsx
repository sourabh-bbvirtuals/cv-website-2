import { redirect, type DataFunctionArgs } from '@remix-run/server-runtime';
import { getSessionStorage } from '~/sessions';

function getGoogleRedirectUri(request: Request): string {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${new URL(request.url).origin}/auth/google/callback`
  );
}

export async function loader({ request }: DataFunctionArgs) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return redirect('/sign-in?error=google_not_configured');
  }

  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const requestedRedirectTo = new URL(request.url).searchParams.get(
    'redirectTo',
  );
  const redirectTo =
    requestedRedirectTo && requestedRedirectTo.startsWith('/')
      ? requestedRedirectTo
      : '/account';
  const state = crypto.randomUUID();
  session.set('google_oauth_state', state);
  session.set('google_oauth_redirect_to', redirectTo);

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', getGoogleRedirectUri(request));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('access_type', 'offline');

  return redirect(authUrl.toString(), {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export default function AuthGoogleRoute() {
  return null;
}
