/**
 * Server-side guest token management.
 * Uses a SEPARATE cookie (not the main __session) to avoid conflicts
 * with the root loader's Vendure session commits.
 */
import { createCookie } from '@remix-run/node';
import {
  requestGuestToken,
  LimitReachedError,
  GuestTokenInvalidError,
} from './bbServer';
import { getSessionStorage } from '~/sessions';

const guestTokenCookie = createCookie('__guest_token', {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24, // 24 hours
});

async function isUserLoggedIn(request: Request): Promise<boolean> {
  const storage = await getSessionStorage();
  const session = await storage.getSession(request.headers.get('Cookie'));
  const authToken = session.get('authToken');
  return !!authToken;
}

async function readGuestToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('Cookie');
  const value = await guestTokenCookie.parse(cookieHeader);
  return typeof value === 'string' ? value : null;
}

async function writeGuestToken(token: string): Promise<string> {
  return guestTokenCookie.serialize(token);
}

export async function getOrCreateGuestToken(
  request: Request,
): Promise<{ token: string; setCookie?: string }> {
  let token = await readGuestToken(request);

  if (token) {
    return { token };
  }

  token = await requestGuestToken();
  const setCookie = await writeGuestToken(token);
  return { token, setCookie };
}

export async function refreshGuestToken(): Promise<{
  token: string;
  setCookie: string;
} | null> {
  try {
    const token = await requestGuestToken();
    const setCookie = await writeGuestToken(token);
    return { token, setCookie };
  } catch {
    return null;
  }
}

/**
 * Wrapper that calls a BB server function with the guest token,
 * automatically handling token refresh on GuestTokenInvalidError.
 *
 * For logged-in users, LimitReachedError also triggers a token refresh
 * so they never see the limit overlay.
 * For guests, LimitReachedError propagates to the caller.
 */
export async function withGuestToken<T>(
  request: Request,
  fn: (token: string) => Promise<T>,
): Promise<{ data: T; headers?: HeadersInit }> {
  const { token, setCookie } = await getOrCreateGuestToken(request);
  const headers: HeadersInit | undefined = setCookie
    ? { 'Set-Cookie': setCookie }
    : undefined;

  try {
    const data = await fn(token);
    return { data, headers };
  } catch (err) {
    if (err instanceof GuestTokenInvalidError) {
      const refreshed = await refreshGuestToken();
      if (!refreshed) throw err;

      const data = await fn(refreshed.token);
      return { data, headers: { 'Set-Cookie': refreshed.setCookie } };
    }

    if (err instanceof LimitReachedError) {
      const loggedIn = await isUserLoggedIn(request);
      if (loggedIn) {
        const refreshed = await refreshGuestToken();
        if (!refreshed) throw err;

        const data = await fn(refreshed.token);
        return { data, headers: { 'Set-Cookie': refreshed.setCookie } };
      }
    }

    throw err;
  }
}

export { LimitReachedError };
