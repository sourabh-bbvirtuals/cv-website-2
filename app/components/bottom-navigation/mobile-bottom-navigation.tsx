import { Link, useMatches, useOutletContext } from '@remix-run/react';
import { ShoppingBag, User, Search, Heart } from 'lucide-react';
import { RootLoaderData } from '~/root';

export default function MobileBottomNavigation() {
  const matches = useMatches();
  const rootMatch = matches.find((match) => match.id === 'root');
  const rootData = rootMatch?.data as RootLoaderData;
  const context = useOutletContext() as any;
  const { activeCustomer: outletActiveCustomer } = context || {};
  const activeCustomer =
    rootData?.activeCustomer?.activeCustomer || outletActiveCustomer;
  const isSignedIn = !!activeCustomer?.id;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <nav className="mx-auto max-w-[1340px] px-4 py-1.5 grid grid-cols-4 gap-1">
        <Link
          to="/cart"
          className="flex cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-600 hover:text-violet-600"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Shop</span>
        </Link>
        <Link
          to={isSignedIn ? '/account' : '/sign-in'}
          className="flex cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-600 hover:text-violet-600"
        >
          <User className="h-5 w-5" />
          <span>Account</span>
        </Link>
        <Link
          to="/#"
          className="flex cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-600 hover:text-violet-600"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Link>
        <Link
          to="/#"
          className="flex cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-600 hover:text-violet-600"
        >
          <Heart className="h-5 w-5" />
          <span>Wishlist</span>
        </Link>
      </nav>
    </div>
  );
}
