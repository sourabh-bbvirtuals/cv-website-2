'use client';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
}

export const FAQItem = ({ question, answer, isOpen = false }: FAQItemProps) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  return (
    <div className="border-b border-gray-200   py-1.5 xsmall:py-2.5 transition-all duration-300">
      <button
        className="flex w-full items-center justify-between py-3 px-2 text-left transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span
          className={`text-[18px] xsmall:text-[20px] small:text-[22px] font-medium transition-all duration-200 ${
            isExpanded ? 'text-primary-blue' : 'text-default-grey'
          }`}
        >
          {question}
        </span>
        <span
          className={`text-[20px] transition-all duration-200  ${
            isExpanded ? 'text-[#4A3AFF]' : 'text-default-grey'
          }`}
        >
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && (
        <div className="pb-4 text-[16px] xsmall:text-[18px] text-light-grey px-3">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
