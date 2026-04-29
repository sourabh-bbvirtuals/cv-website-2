import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, Instagram, Youtube } from 'lucide-react';
import { useLocation } from '@remix-run/react';

export const youtubeChannels = [
  { label: 'MH Board', href: 'https://youtube.com/@commercevirtualsmh' },
  {
    label: 'CBSE Board',
    href: 'https://youtube.com/@commercevirtualscbseboards',
  },
  { label: 'CUET', href: 'https://youtube.com/@commercevirtualscuet' },
];

export const instagramPages = [
  { label: 'MH Board', href: 'https://www.instagram.com/commercevirtualsmh' },
  {
    label: 'CBSE Board',
    href: 'https://www.instagram.com/commercevirtualcbse',
  },
];

export function SocialDropdown({
  icon,
  label,
  items,
  hoverColor,
}: {
  icon: React.ReactNode;
  label: string;
  items: { label: string; href: string }[];
  hoverColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`text-slate-400 ${hoverColor} transition-colors`}
        aria-label={label}
      >
        {icon}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[160px] z-50">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const TopHeader = () => {
  const location = useLocation();
  const isOurCoursesPage = location.pathname === '/our-courses';

  return (
    <header
      className={`pt-2 md:pt-7 pb-2 md:pb-4 hidden md:flex ${
        isOurCoursesPage ? 'bg-[#FFF8F9]' : ''
      }`}
    >
      <div className="flex justify-between items-center gap-2 w-full custom-container">
        {/* Left Side: Contact Info */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-lightgray text-base leading-[100%]">
          <a
            href="tel:+916291040600"
            className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
          >
            <Phone size={14} className="text-lightgray" />
            <span className="text-base">+91 6291 040 600</span>
          </a>

          <a
            href="mailto:support@commercevirtuals.com"
            className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
          >
            <Mail size={14} className="text-lightgray" />
            <span className="text-base">support@commercevirtuals.com</span>
          </a>
        </div>

        {/* Right Side: Social Media */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <SocialDropdown
            icon={<Instagram size={18} />}
            label="Instagram"
            items={instagramPages}
            hoverColor="hover:text-pink-600"
          />
          <SocialDropdown
            icon={<Youtube size={20} />}
            label="YouTube"
            items={youtubeChannels}
            hoverColor="hover:text-red-600"
          />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
