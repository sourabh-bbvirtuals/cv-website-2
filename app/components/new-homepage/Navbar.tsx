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
          <Link
            to="/olympiad"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '999px',
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: 'white',
              background:
                'linear-gradient(180deg, #3B8BFF 0%, #0165FD 50%, #014BC4 100%)',
              cursor: 'pointer',
              overflow: 'hidden',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.45) inset, 0 -2px 0 rgba(0,0,0,0.18) inset, 0 6px 18px rgba(1,101,253,0.45)',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              animation:
                'btn-pulse 2s ease-in-out infinite, btn-breathe 2.4s ease-in-out infinite',
            }}
            className="olympiad-nav-btn"
          >
            <style>{`
                @keyframes btn-pulse {
                  0%, 100% { box-shadow: 0 1px 0 rgba(255,255,255,0.45) inset, 0 -2px 0 rgba(0,0,0,0.18) inset, 0 6px 18px rgba(1,101,253,0.45), 0 0 0 0 rgba(1,101,253,0.55); }
                  50% { box-shadow: 0 1px 0 rgba(255,255,255,0.45) inset, 0 -2px 0 rgba(0,0,0,0.18) inset, 0 8px 24px rgba(1,101,253,0.6), 0 0 0 10px rgba(1,101,253,0); }
                }
                @keyframes btn-breathe {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.04); }
                }
                @keyframes btn-shine {
                  0% { left: -75%; }
                  60%, 100% { left: 125%; }
                }
                @keyframes btn-twinkle {
                  0%, 100% { opacity: 0.3; transform: scale(0.8); }
                  50% { opacity: 1; transform: scale(1.25); }
                }
                .olympiad-nav-btn::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  left: -75%;
                  width: 50%;
                  height: 100%;
                  background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
                  transform: skewX(-20deg);
                  animation: btn-shine 3s ease-in-out infinite;
                  pointer-events: none;
                }
                .olympiad-nav-btn:hover { filter: brightness(1.08); }
                .olympiad-nav-btn:active { filter: brightness(0.95); }
                /* Responsive sizing: Hidden on mobile, shown after 425px */
                .olympiad-nav-btn { display: none !important; }
                @media (min-width: 426px) {
                  .olympiad-nav-btn { height: 36px; padding: 0 14px; font-size: 12px; display: inline-flex !important; }
                }
                @media (min-width: 1024px) {
                  .olympiad-nav-btn { height: 40px; padding: 0 20px; font-size: 14px; }
                }
              `}</style>
            OLYMPIAD 2026
            <span
              style={{
                position: 'absolute',
                color: 'rgba(255,255,255,0.95)',
                pointerEvents: 'none',
                animation: 'btn-twinkle 2s ease-in-out infinite',
                textShadow: '0 0 6px rgba(255,255,255,0.6)',
                top: '5px',
                right: '12px',
                fontSize: '10px',
                animationDelay: '0s',
              }}
            >
              ✦
            </span>
            <span
              style={{
                position: 'absolute',
                color: 'rgba(255,255,255,0.95)',
                pointerEvents: 'none',
                animation: 'btn-twinkle 2s ease-in-out infinite',
                textShadow: '0 0 6px rgba(255,255,255,0.6)',
                bottom: '6px',
                left: '14px',
                fontSize: '8px',
                animationDelay: '0.7s',
              }}
            >
              ✦
            </span>
            <span
              style={{
                position: 'absolute',
                color: 'rgba(255,255,255,0.95)',
                pointerEvents: 'none',
                animation: 'btn-twinkle 2s ease-in-out infinite',
                textShadow: '0 0 6px rgba(255,255,255,0.6)',
                top: '8px',
                left: '18%',
                fontSize: '6px',
                animationDelay: '1.3s',
              }}
            >
              ✦
            </span>
          </Link>

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
              className="primary-btn text-xs sm:text-base font-medium leading-3 sm:leading-[120%] px-2 md:px-3 sm:px-6 py-2 sm:py-2.75"
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
