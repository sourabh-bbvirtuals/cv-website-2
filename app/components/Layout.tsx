import { useState } from 'react';
import Navbar from './new-homepage/Navbar';
import TopHeader from './new-homepage/TopHeader';
import { useNavigate, useLocation } from '@remix-run/react';

interface LayoutProps {
  children: React.ReactNode;
  /** Quiz flow — no site header (Figma 1:5989 / 1:5813 / 1:5896) */
  bare?: boolean;
}

export default function Layout({ children, bare }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isOurCoursesPage = location.pathname === '/our-courses';

  if (bare) {
    return <div className="bg-[#F5F7FF]">{children}</div>;
  }

  return (
    <div className={`min-h-full ${isOurCoursesPage ? 'bg-[#FFF8F9]' : ''}`}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        {/* Top Header */}
        <TopHeader />

        {/* Navbar */}
        <Navbar />

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
              <Navbar />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
