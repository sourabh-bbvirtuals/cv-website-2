import { useEffect } from 'react';
import {
  useFetcher,
  useSearchParams,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { resetPassword } from '~/providers/account/account';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { getFixedT } from '~/i18next.server';
import { Button } from '~/components/ui/button';

type LoaderReturnType = {
  tokenValid: boolean;
  error?: string;
};

export async function loader({
  request,
}: DataFunctionArgs): Promise<LoaderReturnType> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const t = await getFixedT(request);

  if (!token) {
    return {
      tokenValid: false,
      error: t('tokenError'),
    };
  }

  return { tokenValid: true };
}

export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();
  const password = body.get('password');
  const confirmPassword = body.get('confirmPassword');
  const token = body.get('token');
  const redirectTo = (body.get('redirectTo') || '/sign-in') as string;
  const t = await getFixedT(request);

  if (
    typeof password !== 'string' ||
    typeof token !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return json({ success: false, error: t('invalidInput') }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json(
      { success: false, error: 'Passwords Do Not Match' },
      { status: 400 },
    );
  }

  const result = await resetPassword(token, password, { request });
  if (result.__typename === 'CurrentUser') {
    return json({ success: true, redirectTo, headers: result._headers });
  } else if (result.__typename === 'PasswordResetTokenInvalidError') {
    return json(
      { success: false, error: result.message || 'Invalid token' },
      { status: 401 },
    );
  } else if (result.__typename === 'PasswordResetTokenExpiredError') {
    return json(
      { success: false, error: result.message || 'Token expired' },
      { status: 401 },
    );
  } else if (result.__typename === 'PasswordValidationError') {
    return json(
      { success: false, error: result.message || 'Invalid token' },
      { status: 401 },
    );
  } else {
    return json(
      { success: false, error: 'Error resetting password' },
      { status: 401 },
    );
  }
}

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData<LoaderReturnType>();
  const fetcher = useFetcher<{
    success: boolean;
    error?: string;
    redirectTo?: string;
    headers?: Record<string, string>;
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.success) {
      const timer = setTimeout(() => {
        navigate('/sign-in');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data, navigate]);

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <a
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign In
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!loaderData.tokenValid ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{loaderData.error}</p>
                </div>
              </div>
            </div>
          ) : (
            <fetcher.Form method="post">
              <fieldset
                disabled={fetcher.state !== 'idle'}
                className="space-y-6"
              >
                <input
                  type="hidden"
                  name="token"
                  value={searchParams.get('token') ?? ''}
                />
                <input
                  type="hidden"
                  name="redirectTo"
                  value={searchParams.get('redirectTo') ?? '/sign-in'}
                />
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('account.newPassword')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="New Password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('account.confirmPassword')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Confirm Password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {fetcher.data &&
                  !fetcher.data.success &&
                  fetcher.state === 'idle' && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircleIcon
                            className="h-5 w-5 text-red-400"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Error Resetting Password
                          </h3>
                          <p className="text-sm text-red-700 mt-2">
                            {fetcher.data.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {fetcher.data?.success && (
                  <div className="rounded-md bg-green-100 p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          Password Reset Successfully
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Redirecting in 5 seconds...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!fetcher.data?.success && (
                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <span className="flex gap-4 items-center">
                        {fetcher.state !== 'idle' && (
                          <ArrowPathIcon className="animate-spin h-5 w-5 text-white" />
                        )}
                        Reset Password
                      </span>
                    </Button>
                  </div>
                )}
              </fieldset>
            </fetcher.Form>
          )}
        </div>
      </div>
    </div>
  );
}
