import React from 'react';
import {
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  Youtube,
} from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Know More',
      links: [
        'About Us',
        'Terms & Conditions',
        'Refund & Cancellations',
        'Contact us',
        'Privacy Policy',
      ],
    },
    { title: 'Connect', links: ['Youtube', 'Instagram'] },
  ];

  const socialIcons = [
    { Icon: MessageCircle, href: '#' },
    { Icon: Facebook, href: '#' },
    { Icon: Instagram, href: '#' },
    { Icon: Send, href: '#' },
    { Icon: Youtube, href: '#' },
  ];

  return (
    <footer className="w-full pt-10 lg:pt-25 bg-[linear-gradient(360deg,#0272FF_0%,rgba(2,114,255,0.2)_20%,rgba(255,255,255,0)_100%)]">
      {/* 1. Main Footer Wrapper with Bottom-to-Top Gradient */}
      <div className="w-full bg-transparent">
        {/* CTA Section */}
        <div className="px-4 text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-lightgray mb-2 md:mb-4">
            Call us Directly for Purchase Related Queries
          </h2>
          <p className="text-lightgray/50 max-w-143.75 mx-auto mb-6 lg:mb-9 text-sm md:text-base leading-[120%]">
            Get instant assistance from our team for any purchase-related
            questions. We're here to help you make the right decision, faster.
          </p>
          <a
            href="tel:8272332948"
            className="inline-flex items-center gap-2 primary-btn font-medium py-3 md:py-4 px-4 md:px-6 md:text-xl leading-[120%]!"
          >
            <Phone size={20} fill="currentColor" />
            Call Now (827-233-2948)
          </a>
        </div>

        {/* 2. Watermark Text Container */}
        <div className="relative flex justify-center items-center px-4">
          <h2
            className="text-5xl md:text-[80px] 2xl:text-[100px] 4xl:text-[112px]! relative z-10
            font-black tracking-widest text-center leading-[120%]
            /* Figma Text Gradient */
            bg-[linear-gradient(180deg,rgba(61,147,255,0.4)_0%,rgba(255,255,255,0)_91.39%)] 
            bg-clip-text text-transparent
            select-none -mb-6
          
          "
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
            <div className="flex flex-col gap-6 shrink-0">
              <a href="/">
                <img src="/assets/logo.png" alt="Logo" className="w-55" />
              </a>
              <div className="flex gap-3 mt-4">
                {socialIcons.map(({ Icon, href }, index) => (
                  <a
                    key={index}
                    href={href}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-[#BAC2CB] hover:text-blue-500 transition-colors border border-gray-100"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Container */}
            <div className="flex w-full max-w-225 justify-between  lg:justify-end gap-y-6 gap-x-10 flex-wrap">
              {footerLinks.map((section, index) => (
                <div
                  key={section.title}
                  className={`${index === 0 ? 'xl:w-62.5' : 'w-auto'}`}
                >
                  <h3 className="font-bold text-lightgray mb-2 sm:mb-4.25">
                    {section.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {section.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-lightgray/80 hover:text-blue-600 transition-colors leading-[150%]"
                        >
                          {link}
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
                    Sales Contact -{' '}
                    <a href="tel:7718866966" className="hover:underline">
                      7718866966
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
            © 2026 BB Virtuals, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
