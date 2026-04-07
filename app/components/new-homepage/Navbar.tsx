import React, { useState } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
import {
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  ShoppingBasket,
  ShoppingCart,
} from 'lucide-react';
import BoardDropdown from './BoardDropdown';
import { useRootLoader } from '~/utils/use-root-loader';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCustomer: customerData } = useRootLoader();
  const isLoggedIn = !!customerData?.activeCustomer;
  const isOurCoursesPage = location.pathname === '/our-courses';

  return (
    <nav
      className={`w-full py-1 sm:py-3 mt-4 md:mt-0 relative z-20 ${
        isOurCoursesPage ? 'bg-[#FFF8F9]' : ''
      }`}
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
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* 1. Desktop Board Dropdown (Pill UI) */}
          <div className="hidden xl:block">
            <BoardDropdown isMobile={false} />
          </div>

          {/* Search Icon - Desktop */}
          <button className="hidden xl:block p-3 border-[#0816271A] text-lightgray border hover:bg-gray-100 rounded-full transition-colors">
            <Search size={20} />
          </button>

          <button className="hidden xl:block p-3 border-[#0816271A] text-lightgray border hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart size={20} />
          </button>

          {/* Login - Desktop */}
          {!isLoggedIn ? (
            <button
              onClick={() => navigate('/sign-in')}
              className="hidden xl:block text-lightgray font-medium text-base px-2 hover:text-blue-600 transition-colors"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => navigate('/account')}
              className="hidden xl:flex text-lightgray font-medium text-base px-2 hover:text-blue-600 transition-colors items-center gap-2"
            >
              <User size={18} />
              Account
            </button>
          )}

          {/* CTA Button */}
          <button className="primary-btn text-sm sm:text-base font-medium leading-[120%] px-3 sm:px-6 py-2 sm:py-2.75">
            Start For Free
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden p-2 text-lightgray hover:bg-gray-50 rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (xl se niche dikhega) */}
      {isOpen && (
        <div className="absolute top-25 md:top-28 left-4 right-4 bg-white border border-gray-100 shadow-2xl rounded-xl lg:rounded-3xl p-4 lg:p-6 flex flex-col gap-5 xl:hidden z-50 animate-in fade-in zoom-in duration-300">
          {/* Mobile Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-400"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

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
            <div className="border-t my-1"></div>
            {!isLoggedIn ? (
              <a
                href="/sign-in"
                className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors pt-2"
              >
                Login
              </a>
            ) : (
              <a
                href="/account"
                className="text-lightgray font-medium text-lg hover:text-blue-600 transition-colors pt-2 flex items-center gap-2"
              >
                <User size={20} />
                My Account
              </a>
            )}
          </div>

          {/* 2. Mobile Board Dropdown (Card UI) */}
          <div className="w-full">
            <BoardDropdown isMobile={true} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
