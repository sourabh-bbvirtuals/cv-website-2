import { Link } from '@remix-run/react';
import { useState } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

export function VsmartHeader({
  onCartIconClick,
  cartQuantity,
}: {
  onCartIconClick: () => void;
  cartQuantity: number;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  const navigationMenu = [
    { name: 'Lectures' },
    { name: 'Books' },
    { name: 'Test Series' },
    { name: 'Free Resources' },
    { name: 'Support' },
    { name: 'Blogs' },
  ];

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonVisible(true);
    setTimeout(() => setComingSoonVisible(false), 2000);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top notification bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white text-center py-2 px-4">
        <p className="text-sm font-medium tracking-wide">
          Commerce Virtuals – Best Online Commerce Classes for Class 11 & 12
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                className="h-10 w-auto"
                src="/images/logo.webp"
                alt="Commerce Virtuals"
                onError={(e) => {
                  e.currentTarget.src = '/images/logo.webp';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navigationMenu.map((item) => (
              <button
                key={item.name}
                onClick={handleComingSoon}
                className="px-3 py-2 text-[15px] font-medium text-gray-700 hover:text-indigo-700 border-b-2 border-transparent hover:border-indigo-600 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {/* Login link */}
            <Link
              to="/sign-in"
              className="text-gray-700 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-md"
            >
              <UserIcon className="h-5 w-5" />
              Login
            </Link>

            {/* Cart */}
            <button
              onClick={onCartIconClick}
              className="relative p-2 text-gray-700 hover:text-indigo-700 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationMenu.map((item) => (
                <button
                  key={item.name}
                  className="text-gray-800 hover:text-indigo-700 block px-3 py-2 text-base font-medium w-full text-left"
                  onClick={(e) => {
                    handleComingSoon(e);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {comingSoonVisible && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-medium">
            Coming Soon
          </div>
        </div>
      )}
    </header>
  );
}
