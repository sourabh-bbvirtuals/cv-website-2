import { Link } from '@remix-run/react';

export default function WishlistRoute() {
  return (
    <main className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-[#1c212f]">Wishlist</h1>
        <p className="mt-2 text-slate-600">Coming soon.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
