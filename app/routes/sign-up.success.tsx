import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import Layout from '~/components/Layout';

export async function action() {
  return redirect('/');
}

export default function SignUp2Success() {
  return (
    <Layout>
      <div className="bg-slate-50 text-slate-900 antialiased">
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 ring-1 ring-slate-200">
              <Form className="space-y-6" method="post">
                <div>
                  <div className="flex justify-center">
                    <div className="flex-grow">
                      <CheckCircleIcon
                        className="h-20 w-20 m-auto mb-4 text-emerald-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                      Registration Submitted!
                    </h2>
                    <p className="text-slate-600 mb-6">
                      If this email is not already registered, you will receive
                      a confirmation email shortly. Please check your inbox and
                      follow the instructions to complete your registration.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
