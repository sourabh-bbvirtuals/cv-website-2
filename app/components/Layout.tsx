import { useState } from 'react';
import Navbar from './new-homepage/Navbar';
import TopHeader from './new-homepage/TopHeader';
import { useNavigate, useLocation, Link } from '@remix-run/react';

interface LayoutProps {
  children: React.ReactNode;
  /** Quiz flow — no site header (Figma 1:5989 / 1:5813 / 1:5896) */
  bare?: boolean;
}

export default function Layout({ children, bare }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isOurCoursesPage = location.pathname === '/our-courses';
  const isOurCoursesDetailPage = location.pathname.startsWith('/our-courses/');

  if (bare) {
    return <div className="min-h-full ">{children}</div>;
  }

  return (
    <div className={`min-h-full ${isOurCoursesPage ? 'bg-[#FFF8F9]' : ''}`}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="px-4">
          {/* Top Header */}
          <TopHeader />

          {/* Navbar */}
          <Navbar isOurCoursesDetailPage={isOurCoursesDetailPage} />
        </div>

        {/* Olympiad Announcement Bar */}
        <div className="block min-[426px]:hidden w-full mt-4 md:mt-6">
          <Link to="/olympiad" className="block w-full">
            <div className="relative py-2 lg:py-3 w-full flex justify-center items-center overflow-hidden bg-[#125BFF] -mt-3.5">
              <div className="absolute inset-0 bg-[url('/assets/images/olympiad/announcementbar.png')] bg-cover bg-center bg-no-repeat pointer-events-none" />

              <div className="text-white text-base md:text-xl font-black uppercase font-oswald flex items-center gap-2 z-10 relative cursor-pointer">
                <span
                  style={{
                    textShadow: `
                      -1px -1px 0 #024DE1,
                       1px -1px 0 #024DE1,
                      -1px  1px 0 #024DE1,
                       1px  1px 0 #024DE1,
                       2px  2px 0 #024DE1,
                       3px  3px 0 #024DE1,
                       4px  4px 0 #024DE1
                    `,
                  }}
                  className="tracking-wide"
                >
                  OLYMPIAD 2026
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="mb-4" onClick={() => setMobileOpen(false)}>
                Close
              </button>
              <Navbar isOurCoursesDetailPage={isOurCoursesDetailPage} />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
