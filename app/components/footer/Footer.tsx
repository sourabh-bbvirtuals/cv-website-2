import React, { useState, useRef, useEffect } from 'react';
import { Phone, Instagram, Youtube } from 'lucide-react';

const YOUTUBE_CHANNELS = [
  { label: 'MH Board', href: 'https://youtube.com/@commercevirtualsmh', boardKey: 'mh' },
  { label: 'CBSE Board', href: 'https://youtube.com/@commercevirtualscbseboards', boardKey: 'cbse' },
  { label: 'CUET', href: 'https://youtube.com/@commercevirtualscuet', boardKey: 'cuet' },
];

const INSTAGRAM_PAGES = [
  { label: 'MH Board', href: 'https://www.instagram.com/commercevirtualsmh' },
  { label: 'CBSE Board', href: 'https://www.instagram.com/commercevirtualcbse' },
];

function useUserBoard(): string | null {
  const [board, setBoard] = useState<string | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bb_user_profile');
      if (!stored) return;
      const profile = JSON.parse(stored);
      const raw = (profile.board || '').toLowerCase().trim();
      if (raw) setBoard(raw);
    } catch {}
  }, []);
  return board;
}

function resolveYoutubeForBoard(board: string | null) {
  if (!board) return null;
  const b = board.toLowerCase();
  if (b.includes('cuet')) return YOUTUBE_CHANNELS.find((c) => c.boardKey === 'cuet') ?? null;
  if (b.includes('mh') || b.includes('maharashtra') || b.includes('hsc')) return YOUTUBE_CHANNELS.find((c) => c.boardKey === 'mh') ?? null;
  if (b.includes('cbse')) return YOUTUBE_CHANNELS.find((c) => c.boardKey === 'cbse') ?? null;
  return null;
}

const Footer = () => {
  const userBoard = useUserBoard();
  const matchedYoutube = resolveYoutubeForBoard(userBoard);

  const footerLinks = [
    {
      title: 'Know More',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'Terms & Conditions', href: '/terms-and-conditions' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Refund & Cancellations', href: '/refund-and-cancellations' },
      ],
    },
  ];

  return (
    <footer
      className="w-full bg-[#f7f8ff]  pt-10 lg:pt-25 "
      style={{
        background:
          'linear-gradient(360deg, #3A7FFF 0%, rgba(58, 127, 255, 0.18) 10%, rgba(255, 255, 0, 0) )',
      }}
    >
      {/* 1. Main Footer Wrapper with Bottom-to-Top Gradient */}
      <div className="w-full ">
        {/* CTA Section */}
        <div className="px-4 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-lightgray mb-2 md:mb-4">
            Call us Directly for Purchase Related Queries
          </h2>
          <p className="text-lightgray/50 max-w-full md:max-w-3xl mx-auto mb-6 lg:mb-9 text-sm md:text-xl leading-[120%]">
            Get instant assistance from our team for any purchase-related
            questions. <br />
            We're here to help you make the right decision, faster.
          </p>
          <a
            href="tel:+916291040600"
            className="inline-flex items-center justify-center text-center text-base gap-2 primary-btn w-[340px] md:w-[420px] h-[52px] md:h-[64px] font-medium py-4 px-8 md:text-xl leading-[120%]!"
          >
            <Phone size={20} fill="currentColor" />
            Call Now (+91 62910 40 600)
          </a>
        </div>

        {/* 2. Watermark Text Container */}
        <div className="relative flex justify-center items-center px-4 mt-4">
          <h2
            className="text-[40px] md:text-[150px] relative z-10
            font-semibold text-center leading-[120%]
            bg-clip-text text-transparent
            select-none -mb-6
          "
            style={{
              fontFamily: 'Geist, sans-serif',
              letterSpacing: '-3%',
              lineHeight: '120%',
              background:
                'linear-gradient(180deg, rgba(61, 147, 255, 0.15) 0%, rgba(61, 147, 255, 0.10) 35%, rgba(61, 147, 255, 0.06) 65%, rgba(61, 147, 255, 0.02) 95%, rgba(255, 255, 255, 0) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Commerce Virtual
          </h2>
        </div>
        {/* 3. Main Footer Content (Links & Logo) */}
        <div className="py-10 lg:py-15 backdrop-blur-[50px] bg-transparent">
          <div
            className="custom-container flex justify-between relative z-10 gap-8 
          flex-col lg:flex-row "
          >
            {/* Logo & Socials */}
            <div className="flex flex-col gap-6 shrink-0 mt-2 md:mt-0">
              <a href="/">
                <img src="/assets/logo.png" alt="Logo" className="w-55" />
              </a>
              <div className="flex gap-3 mt-4">
                <FooterSocialDropdown
                  icon={<Instagram size={20} />}
                  label="Instagram"
                  items={INSTAGRAM_PAGES}
                />
                {matchedYoutube ? (
                  <a
                    href={matchedYoutube.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#BAC2CB] hover:text-red-500 transition-colors border border-gray-100"
                    aria-label={`YouTube – ${matchedYoutube.label}`}
                  >
                    <Youtube size={20} />
                  </a>
                ) : (
                  <FooterSocialDropdown
                    icon={<Youtube size={20} />}
                    label="YouTube"
                    items={YOUTUBE_CHANNELS}
                  />
                )}
                <a
                  href="https://wa.me/916291040600?text=Hi+Commerce+Virtuals%2C+I%27d+like+to+know+more+about+courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#BAC2CB] hover:text-green-500 transition-colors border border-gray-100"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Container */}
            <div className="flex w-full max-w-225 justify-between  lg:justify-end gap-y-6 gap-x-10 flex-wrap">
              {footerLinks.map((section, index) => (
                <div
                  key={section.title}
                  className={`${index === 0 ? 'xl:w-62.5' : 'w-auto'}`}
                >
                  <h3 className="font-bold text-gray-700 mb-2 sm:mb-4.25">
                    {section.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-lightgray/80 hover:text-blue-600 transition-colors leading-[150%]"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Contact Details */}
              <div className="xl:w-77.5">
                <h3 className="font-bold text-lightgray mb-2 sm:mb-4.25">
                  Contact us
                </h3>
                <div className="text-lightgray/80 leading-[150%] flex flex-col gap-2 ">
                  <p>
                    Bunglow No. 340/360, RSC Road No. 37
                    <br />
                    Gorai 2, Near Pragati Auto Stand Borivali
                    <br />
                    West Mumbai - 400091
                  </p>
                  <p>
                    Admissions & Sales -{' '}
                    <a href="tel:+916291040600" className="hover:underline">
                      +91 62910 40 600
                    </a>
                  </p>
                  <p>
                    Support -{' '}
                    <a href="tel:+916291050600" className="hover:underline">
                      +91 62910 50 600
                    </a>
                  </p>
                  <p>
                    <a href="mailto:support@commercevirtuals.com" className="hover:underline">
                      support@commercevirtuals.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="text-center py-4 md:py-6 border-t border-blue-200/20">
          <p className="leading-[120%] text-white/60 font-medium">
            © 2026 Commerce Virtuals
          </p>
        </div>
      </div>
    </footer>
  );
};

function FooterSocialDropdown({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#BAC2CB] hover:text-blue-500 transition-colors border border-gray-100"
        aria-label={label}
      >
        {icon}
      </button>
      {open && (
        <div className="absolute left-0 bottom-full mb-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 min-w-[160px] z-50">
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

export default Footer;
