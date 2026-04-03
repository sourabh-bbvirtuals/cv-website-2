import { useState } from 'react';
import { Form, useFetcher, useSearchParams } from '@remix-run/react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import Layout from '~/components/Layout';
import {
  MailIcon,
  MailCheckIcon,
  Loader2Icon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';
import { requestPasswordReset } from '~/providers/account/account';
import MobileBottomNavigation from '~/components/bottom-navigation/mobile-bottom-navigation';

export const meta: MetaFunction = () => {
  return [
    { title: 'Shubham Agrawal Classes — Forgot password' },
    {
      name: 'description',
      content: 'Reset your Shubham Agrawal Classes password',
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const email = body.get('email');

  if (typeof email !== 'string' || !email) {
    return json({ success: false, error: 'Invalid Email' }, { status: 400 });
  }

  const result = await requestPasswordReset(email, { request });
  if (result.__typename === 'Success') {
    return json({ success: true });
  } else {
    return json({ success: false, error: result.message }, { status: 400 });
  }
}

export default function ForgotPassword2() {
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<{ success: boolean; error?: string }>();
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <Layout>
      <div className="bg-slate-50 text-slate-900 antialiased">
        {/* Forgot Password card */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mx-auto w-full max-w-xl">
            <div className="mx-auto mt-12 sm:mt-16 rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Forgot password
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              {fetcher.data?.success ? (
                <div className="mt-6">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Password reset email sent
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          If an account exists for {email}, you'll receive a
                          reset link shortly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-px w-full bg-slate-200"></div>
                    <span className="text-xs text-slate-500">or</span>
                    <div className="h-px w-full bg-slate-200"></div>
                  </div>

                  {/* Secondary action */}
                  <p className="mt-4 text-center text-sm text-slate-600">
                    Remembered your password?
                    <a
                      href="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-700 ml-1"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              ) : (
                <fetcher.Form
                  method="post"
                  className="mt-6 space-y-5"
                  autoComplete="off"
                >
                  {/* Hidden redirectTo field */}
                  <input
                    type="hidden"
                    name="redirectTo"
                    value={searchParams.get('redirectTo') ?? undefined}
                  />

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <MailIcon className="h-4 w-4" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full rounded-lg border-0 ring-1 ring-inset ring-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      We'll email you a reset link if we find an account with
                      that address.
                    </p>
                  </div>

                  {/* Error messages */}
                  {fetcher.data &&
                    !fetcher.data.success &&
                    fetcher.state === 'idle' && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XCircleIcon
                              className="h-5 w-5 text-red-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              Error
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                              {fetcher.data.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Submit */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-colors hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span>Sending reset link...</span>
                        </>
                      ) : (
                        <>
                          <MailCheckIcon className="h-4 w-4" />
                          <span>Request password reset</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px w-full bg-slate-200"></div>
                    <span className="text-xs text-slate-500">or</span>
                    <div className="h-px w-full bg-slate-200"></div>
                  </div>

                  {/* Secondary action */}
                  <p className="text-center text-sm text-slate-600">
                    Remembered your password?
                    <a
                      href="/login"
                      className="font-medium text-indigo-600 hover:text-indigo-700 ml-1"
                    >
                      Sign in
                    </a>
                  </p>
                </fetcher.Form>
              )}
            </div>
          </section>
        </main>

        {/* Footer spacing */}
        <div className="h-12"></div>
      </div>
      <MobileBottomNavigation />
    </Layout>
  );
}
