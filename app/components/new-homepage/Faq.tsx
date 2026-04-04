import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export const faqs = [
  {
    question: '1. How to attend Live Classes after purchase?',
    answer:
      'You will get the notification of every class in your APP and registered mail or you can access it from My Purchased Courses.',
  },
  {
    question: '2. How to check the study plan?',
    answer:
      'To check the study plan, open your purchased live batch. If you are looking to make a purchase on the store/website, you can find the study plan in the package description section of the course. All details are updated there.',
  },
  {
    question: '3. What should I do if I forget my password?',
    answer:
      "If you forget your password, click on the 'Forgot Password?' link on the login page. An email will be sent to you with instructions to reset your password.",
  },
  {
    question: '4. How can I contact customer support?',
    answer:
      'You can contact customer support through the help center on our website or by emailing support@ourcompany.com for assistance.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="custom-container">
      <div className="text-center mb-8 lg:mb-12 4xl:mb-16!">
        <p className="sm:text-xl font-medium text-lightgray mb-3 4xl:mb-4!">
          FAQs
        </p>
        <h2 className="section-heading">Common Questions</h2>
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

                {/* Arrow Icon with background */}
                <div
                  className={`shrink-0 w-9 h-9 rounded-full bg-[#F8F9FA] flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'rotate-90 bg-blue-50' : 'rotate-0'
                  }`}
                >
                  <ChevronRight
                    size={20}
                    className={`transition-colors duration-300 ${
                      isOpen ? 'text-blue-600' : 'text-lightgray'
                    }`}
                  />
                </div>
              </button>

              {/* Answer Section - Smooth Height Transition */}
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

export default Faq;
