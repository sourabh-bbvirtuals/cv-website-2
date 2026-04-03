import { HomeIcon } from '@heroicons/react/24/outline';
import { useNavigate, type MetaFunction } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import Layout from '~/components/Layout';
import MobileBottomNavigation from '~/components/bottom-navigation/mobile-bottom-navigation';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Coming Soon',
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  if (params.slug === 'blogs') {
    return redirect('/blogs');
  }
  return null;
}

export default function ComingSoonRoute() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="mx-auto flex min-h-[70vh] max-w-[960px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-center px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-[#8d8f95]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c212f]">
            Coming Soon
          </h1>
          <p className="text-md mb-8 max-w-md mx-auto text-[#414151]">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#1c212f] font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <HomeIcon className="w-4 h-4 text-[#1c212f]" />
            Back to Home
          </button>
        </div>
      </div>
      <MobileBottomNavigation />
    </Layout>
  );
}
