import { useState } from 'react';
import Navbar from './new-homepage/Navbar';
import TopHeader from './new-homepage/TopHeader';
import { useNavigate, useLocation, Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';

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
        <div className="">
          {/* Top Header */}
          <TopHeader />

          {/* Navbar */}
          <Navbar isOurCoursesDetailPage={isOurCoursesDetailPage} />

          <div className="w-full hidden min-[426px]:block">
            <Link to="/olympiad" className="block w-full">
              <div className="relative h-[90px] w-full flex justify-center items-center overflow-hidden bg-[#125BFF] -mt-12.5">
                <div className="absolute inset-0 bg-[url('/assets/images/olympiad/home-banner.png')] bg-cover bg-center bg-no-repeat pointer-events-none" />
                <div className="flex items-center justify-center gap-2 text-white mt-8 text-base md:text-xl font-black uppercase font-oswald z-10 relative cursor-pointer">
                  <span className="font-bold text-[24px] leading-none">
                    OLYMPIAD 2026
                  </span>
                  <span className="leading-none">
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Olympiad Announcement Bar */}
        <div className="block min-[426px]:hidden w-full mt-4 md:mt-6">
          <Link to="/olympiad" className="block w-full">
            <div className="relative py-2 lg:py-3 w-full flex justify-center items-center overflow-hidden bg-[#125BFF] -mt-3.5">
              <div className="absolute inset-0 bg-[url('/assets/images/olympiad/announcementbar.png')] bg-cover bg-center bg-no-repeat pointer-events-none" />

              <div className="flex items-center justify-center gap-2 text-white text-base md:text-xl font-black uppercase font-oswald z-10 relative cursor-pointer">
                <span className="leading-none">OLYMPIAD 2026</span>
                <span className="leading-none">
                  <span className="leading-none">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
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
