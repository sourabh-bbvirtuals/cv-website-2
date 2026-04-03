import React from 'react';
import { Phone, Mail, Instagram, Youtube } from 'lucide-react';

const TopHeader = () => {
  return (
    <header className="pt-2 md:pt-7 pb-2 md:pb-7.75">
      <div className="flex justify-between items-center gap-2 w-full custom-container">
        {/* Left Side: Contact Info */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-lightgray text-base leading-[100%]">
          <a
            href="tel:7718866966"
            className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
          >
            <Phone size={14} className="text-lightgray" />
            <span>7718866966</span>
          </a>

          <a
            href="mailto:global@bbvirtuals.com"
            className="flex items-center gap-1 sm:gap-2 hover:text-blue-600 transition-colors text-xs sm:text-base"
          >
            <Mail size={14} className="text-lightgray" />
            <span>global@bbvirtuals.com</span>
          </a>
        </div>

        {/* Right Side: Social Media */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a
            href="#"
            className="text-slate-400 hover:text-pink-600 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="#"
            className="text-slate-400 hover:text-red-600 transition-colors"
            aria-label="YouTube"
          >
            <Youtube size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
