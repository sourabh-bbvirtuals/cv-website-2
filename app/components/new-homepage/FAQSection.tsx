import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ title, faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="custom-container">
      <div className="text-center mb-8 lg:mb-12 4xl:mb-16!">
        <p className="sm:text-xl font-medium text-lightgray mb-3 4xl:mb-4!">
          FAQs
        </p>
        <h2 className="section-heading">{'Common Questions'}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`border border-[#0816271A] rounded-2xl bg-white transition-all duration-300 ${
                isOpen ? 'shadow-sm' : ''
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-4 md:px-6 py-5 text-left outline-none"
              >
                <div className="flex flex-col">
                  <h3
                    className={`text-base md:text-[20px] font-medium! leading-[120%] transition-colors duration-300 ${
                      isOpen ? 'text-blue-600' : 'text-lightgray'
                    }`}
                  >
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'rotate-90 bg-blue-50' : 'rotate-0'
                  }`}
                >
                  <ChevronRight
                    size={14}
                    className={`transition-colors duration-300 ${
                      isOpen ? 'text-blue-600' : 'text-lightgray'
                    }`}
                  />
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 md:px-6 pb-6 text-lightgray/60 text-sm md:text-base leading-[150%]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQSection;
