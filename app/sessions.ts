import { ErrorResult } from '~/generated/graphql';

let sessionStorage: any = null;
let sessionSecret: string | null = null;

export function setSessionSecret(secret: string) {
  if (typeof secret === 'string' && secret.trim().length > 0) {
    sessionSecret = secret;
  }
}

export async function getSessionStorage(env?: { SESSION_SECRET: string }) {
  if (sessionStorage) {
    return sessionStorage;
  }

  try {
    const { createCookieSessionStorage } = await import('@remix-run/node');

    sessionStorage = createCookieSessionStorage({
      cookie: {
        name: '__session',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        secrets: [
          env?.SESSION_SECRET ||
            sessionSecret ||
            process.env.SESSION_SECRET ||
            'awdbhbjahdbaw',
        ],
      },
    });
  } catch (error) {
    console.error('Error creating session storage:', error);
    // Fallback to a simple session storage implementation
    sessionStorage = {
      getSession: async (cookie?: string | null) => {
        return {
          get: (key: string) => undefined,
          set: (key: string, value: any) => {},
          unset: (key: string) => {},
          data: {},
        };
      },
      commitSession: async (session: any) => '',
      destroySession: async (session: any) => '',
    };
  }

  return sessionStorage;
}
