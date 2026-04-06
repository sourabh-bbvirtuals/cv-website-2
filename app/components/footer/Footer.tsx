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
            href="tel:8272332948"
            className="inline-flex items-center justify-center text-center text-base gap-2 primary-btn w-[325px] md:w-[323px] h-[42px] md:h-[56px] font-normal md:font-medium py-4 px-6 md:text-xl leading-[120%]!"
          >
            <Phone size={20} fill="currentColor" />
            Call Now (827-233-2948)
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
                {socialIcons.map(({ Icon, href }, index) => (
                  <a
                    key={index}
                    href={href}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-[#BAC2CB] hover:text-blue-500 transition-colors border border-gray-100"
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
                  <h3 className="font-bold text-gray-700 mb-2 sm:mb-4.25">
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
