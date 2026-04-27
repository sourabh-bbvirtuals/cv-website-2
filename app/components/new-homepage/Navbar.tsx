import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from '@remix-run/react';
import {
  ChevronDown,
  Menu,
  X,
  User,
  ShoppingBasket,
  ShoppingCart,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import BoardDropdown from './BoardDropdown';
import { useRootLoader } from '~/utils/use-root-loader';

interface NavbarProps {
  isOurCoursesDetailPage?: boolean;
}

const Navbar = ({ isOurCoursesDetailPage = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCustomer: customerData } = useRootLoader();
  const customer = customerData?.activeCustomer;
  const isLoggedIn = !!customer;
  const isOurCoursesPage = location.pathname === '/our-courses';
  const showBoardDropdown =
    isLoggedIn &&
    (location.pathname === '/' ||
      location.pathname === '/our-courses' ||
      location.pathname.startsWith('/courses/') ||
      location.pathname === '/free-resources' ||
      location.pathname.startsWith('/free-resources/'));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className={`w-full py-1 sm:py-3 mt-4 md:mt-0 relative z-20 ${
        isOurCoursesPage ? 'bg-[#FFF8F9]' : ''
      } , ${isOurCoursesDetailPage ? 'hidden md:block' : ''} `}
    >
      <div className="absolute h-px w-full left-0 bg-[#0816271A] top-1/2 -translate-y-1/2"></div>
      <div className="custom-container backdrop-blur-[50px] rounded-full border border-[#E2E4E9] py-1 md:py-3.25 flex items-center justify-between bg-white/50">
        {/* Left Side: Logo & Desktop Nav */}
        <div className="flex items-center gap-4 xl:gap-15.75">
          <div className="shrink-0">
            <a href="/">
              <img
                className="w-30 md:w-37.5 xl:w-40.75"
                src="/assets/logo.png"
                alt="Logo"
              />
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center gap-5 text-lightgray leading-[120%] font-medium text-base">
            <a href="/" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <a
              href="/our-courses"
              className="hover:text-blue-600 transition-colors"
            >
              Our Courses
            </a>
            <a
              href="/free-resources"
              className="hover:text-blue-600 transition-colors"
            >
              Free Resources
            </a>
            <a href="/blogs" className="hover:text-blue-600 transition-colors">
              Blogs
            </a>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* 1. Desktop Board Dropdown (Pill UI) */}
          {showBoardDropdown && (
            <div className="hidden lg:block">
              <BoardDropdown isMobile={false} />
            </div>
          )}

          <button
            onClick={() => navigate('/cart')}
            className="hidden lg:block p-3 border-[#0816271A] text-lightgray border hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart size={20} />
          </button>

          {isLoggedIn ? (
            <div className="hidden lg:block relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-base font-medium transition-colors border ${
                  accountOpen
                    ? 'bg-[#081627] text-white border-[#081627]'
                    : 'bg-white text-[#081627] border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>
                  {customer.firstName} {customer.lastName}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    accountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {accountOpen && (
                <div className="absolute top-[120%] right-0 min-w-[200px] bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 z-[100]">
                  <button
                    onClick={() => {
                      navigate('/account');
                      setAccountOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors text-[#081627] font-medium text-base"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/account/orders');
                      setAccountOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors text-[#081627] font-medium text-base"
                  >
                    Order History
                  </button>
                  <div className="border-t border-gray-100 mx-3" />
                  <button
                    onClick={async () => {
                      setAccountOpen(false);
                      await fetch('/api/logout', { method: 'POST' });
                      window.location.href = '/';
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors text-gray-400 font-medium text-base"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/sign-in"
              className="primary-btn text-xs sm:text-base font-medium leading-3 sm:leading-[120%] px-3 sm:px-6 py-2 sm:py-2.75"
            >
              Start For Free
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden p-0 sm:p-2 text-lightgray hover:bg-gray-50 rounded-full "
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (xl se niche dikhega) */}
      {isOpen && (
        <div className="absolute top-25 md:top-28 left-4 right-4 bg-white border border-gray-100 shadow-2xl rounded-xl lg:rounded-3xl p-4 lg:p-6 flex flex-col gap-5 xl:hidden z-50 animate-in fade-in zoom-in duration-300">
          {/* Mobile Links */}
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors"
            >
              Home
            </a>
            <a
              href="/our-courses"
              className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors"
            >
              Our Courses
            </a>
            <a
              href="/free-resources"
              className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors"
            >
              Free Resources
            </a>
            <a
              href="/blogs"
              className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors"
            >
              Blogs
            </a>
            <div className="border-t my-1"></div>
            {isLoggedIn ? (
              <>
                <a
                  href="/account"
                  className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors pt-2 flex items-center gap-2"
                >
                  <User size={20} />
                  {customer.firstName} {customer.lastName}
                </a>
                <a
                  href="/account/orders"
                  className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors"
                >
                  Order History
                </a>
                <button
                  onClick={async () => {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="text-gray-400 font-medium text-lg hover:text-blue-600 transition-colors text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/sign-in"
                className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors pt-2"
              >
                Login / Sign Up
              </a>
            )}
          </div>

          {/* 2. Mobile Board Dropdown (Card UI) */}
          {showBoardDropdown && (
            <div className="w-full">
              <BoardDropdown isMobile={true} />
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
