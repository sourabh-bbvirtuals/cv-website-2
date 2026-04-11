import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export const faqs = [
  {
    question: 'What boards does Commerce Virtuals cover?',
    answer:
      'We specialize in CBSE (Class 11 & 12), Maharashtra State Board HSC (Class 11 & 12), and CUET-UG Entrance Test preparation for commerce students.',
  },
  {
    question: 'Which subjects are covered?',
    answer:
      'For CBSE: Accountancy, Business Studies, Economics, Applied Mathematics, IP/CS. For Maharashtra Board: Book-Keeping & Accountancy, OCM, Economics, Secretarial Practice. For CUET: Domain subjects, English, and General Test.',
  },
  {
    question: 'What is included in the test series?',
    answer:
      'Our test series includes unit tests, chapter-wise quizzes, mock exams aligned with board patterns, CUET practice tests, detailed solutions, and performance analytics to track your progress.',
  },
  {
    question: 'Do you offer mentorship?',
    answer:
      'Mentorship is coming soon! We are developing comprehensive guidance services including personalized study plans, 1-on-1 guidance, doubt resolution, and career planning. Contact us at +91 62910 40 600 to express your interest.',
  },
  {
    question: 'How is Commerce Virtuals different from free online content?',
    answer:
      'Unlike scattered free content, Commerce Virtuals offers a structured learning platform with organized test series, performance tracking, mentorship (coming soon), personalized guidance, and deep Maharashtra Board focus—all in one place.',
  },
  {
    question: 'What payment options do you accept?',
    answer:
      'We accept Credit & Debit Cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking (all major Indian banks), and Digital Wallets (Paytm, Amazon Pay).',
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 7-day money-back guarantee. You can request a full refund within 7 days of purchase if you haven't consumed more than 20% of the course content. Visit our Refund & Cancellations Policy page for complete details.",
  },
  {
    question: 'Can I access content on mobile?',
    answer:
      'Yes! Commerce Virtuals is fully accessible on smartphones (iOS & Android), tablets, and desktops/laptops. Video quality auto-adjusts based on your internet speed.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach us at +91 62910 40 600 (Admissions & Sales) or email support@commercevirtuals.com. We aim to respond within 24 hours on business days.',
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
