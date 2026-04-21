import React, { useState, useRef, useEffect, RefObject } from 'react';
import { Link } from '@remix-run/react';

import { useBoardSelection } from '~/context/BoardSelectionContext';

// Hook to handle clicking outside of the custom dropdown
type AnyEvent = MouseEvent | TouchEvent;

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: AnyEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// Interface for CustomSelect props
interface CustomSelectProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  placeholder: string;
}

// Reusable Custom Dropdown Component
const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  selected,
  onSelect,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className="mb-2 xl:mb-4 relative" ref={ref}>
      <label className="block text-xs sm:text-sm 4xl:text-base! text-lightgray mb-1 xl:mb-1.5 font-medium opacity-50">
        {label}
      </label>
      <div
        className="flex items-center justify-between w-full border border-[#0816271A] rounded-full px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white cursor-pointer hover:border-slate-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`text-xs sm:text-sm 4xl:text-base! font-medium leading-[120%] ${
            selected ? 'text-lightgray' : 'text-slate-400'
          }`}
        >
          {selected || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 max-h-40 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              className="px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors font-medium"
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Interface for Form Data state
interface FormDataState {
  class: string;
  board: string;
  name: string;
  phone: string;
}

const Hero: React.FC<{ isLoggedIn?: boolean }> = ({ isLoggedIn }) => {
  const [formData, setFormData] = useState<FormDataState>({
    class: 'XII',
    board: 'CBSE',
    name: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const formBoardOptions: string[] = ['MH', 'CBSE', 'CUET UG'];
  const classOptions: string[] =
    formData.board === 'CUET UG' ? ['XII'] : ['XI', 'XII'];

  const { boardOptions, setSelectedBoard } = useBoardSelection();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    if (formData.name.trim() && formData.phone.trim()) {
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          board: formData.board,
          courseInterest: `${formData.board} - ${formData.class}`,
        }),
      }).catch(() => {});
    }

    const classMap: Record<string, string> = { XI: '11', XII: '12' };
    const classNum = classMap[formData.class] || formData.class;
    const boardLower = formData.board.toLowerCase().replace(/\s+/g, '');

    const match =
      boardOptions.find((o) => {
        const oBoard = o.board.toLowerCase().replace(/\s+/g, '');
        const oClass = o.class.toLowerCase();
        const boardMatch =
          oBoard === boardLower ||
          oBoard.includes(boardLower) ||
          boardLower.includes(oBoard);
        const classMatch = oClass.includes(classNum);
        return boardMatch && classMatch;
      }) ||
      boardOptions.find((o) => {
        const oBoard = o.board.toLowerCase().replace(/\s+/g, '');
        return (
          oBoard === boardLower ||
          oBoard.includes(boardLower) ||
          boardLower.includes(oBoard)
        );
      });

    if (match) {
      setSelectedBoard(match.slug);
    }

    setSubmitting(false);
    window.location.href = '/sign-in';
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove non-numeric characters
    value = value.replace(/\D/g, '');

    // Limit to 10 digits
    value = value.slice(0, 10);

    setFormData({ ...formData, phone: value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  return (
    <section className="bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center relative">
      <div className="custom-container pb-10 lg:pb-12 4xl:pb-28! pt-28.5 md:pt-57.5 xl:pt-65.75 w-full">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-4">
          {/* Left Column: Content & Stats */}
          <div
            className={`w-full sm:p-4 lg:py-9 lg:pr-12 rounded-3xl max-sm:bg-none! flex flex-col ${
              isLoggedIn
                ? 'items-center text-center'
                : 'text-center sm:text-left sm:items-start'
            }`}
            style={{
              background: isLoggedIn
                ? ''
                : 'linear-gradient(to left, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
              backdropFilter: isLoggedIn ? 'blur(10px)' : 'none',
              border: isLoggedIn ? '' : 'none',
            }}
          >
            {/* card content */}
            <div
              className={`flex flex-col h-full gap-6 md:gap-16 ${
                isLoggedIn ? 'items-center text-center' : ''
              }`}
            >
              <div
                className={`flex-1 gap-5 flex flex-col justify-center ${
                  isLoggedIn
                    ? 'items-center text-center md:w-[770px] max-w-full'
                    : 'items-center md:items-start md:text-left md:justify-start'
                }`}
              >
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1 leading-[120%] rounded-full bg-[#0816270D] text-xs  sm:text-base font-medium text-gray-700 border border-[#0816270D]">
                  <span>MH Board</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>CBSE</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>CUET</span>
                </div>
                {/* Headline */}
                <h1 className="text-3xl xl:text-[60px] font-semibold tracking-[-0.03em]">
                  Commerce Virtuals |<br className="" /> Courses for Class 11 &
                  12
                </h1>
                {/* Subheadline */}
                <p className="text-[13px] sm:text-base xl:text-xl text-lightgray w-[275px] sm:w-[345px] md:w-full  leading-[150%]">
                  India's only commerce-exclusive EdTech platform. Structured
                  courses, test series & mentorship for CBSE, Maharashtra Board
                  HSC and CUET-UG. Built for Class 11 & 12 commerce students.
                </p>
                {/* CTA Button */}
                <div
                  className={`flex w-full mt-4 gap-[3px] sm:gap-4 ${
                    isLoggedIn
                      ? 'justify-center'
                      : 'justify-center sm:justify-start'
                  }`}
                >
                  <Link
                    to="/our-courses"
                    className="flex items-center gap-1 sm:gap-3 bg-[#3A6BFC] text-white font-medium px-2 sm:px-4 py-3 md:py-4 md:px-6 leading-[120%] rounded-full transition-all mb-5 sm:mb-8 4xl:mb-12! text-[12px] sm:text-base lg:text-lg 4xl:text-xl! shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] hover:brightness-110 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>Explore Courses</span>
                  </Link>
                  <Link
                    to="/free-resources"
                    className="flex items-center gap-1 sm:gap-3 bg-white text-gray-700 font-medium px-2 sm:px-4 py-3 md:py-4 md:px-6 leading-[120%] rounded-full transition-all mb-5 sm:mb-8 4xl:mb-12! border border-[#0816271A] text-[12px] sm:text-base lg:text-lg 4xl:text-xl! hover:bg-slate-100 hover:border-slate-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>Explore Free Resources</span>
                  </Link>
                </div>
              </div>
              {/* Stats Row */}
              <div
                className={`grid grid-cols-2 xl:grid-cols-4 gap-6 whitespace-nowrap justify-center sm:justify-start ${
                  isLoggedIn ? 'w-full' : ''
                }`}
              >
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Enrolled Students
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    10,000+
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Free Resources
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    100+
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Average Rating
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    4.9
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Available Courses
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    20+
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            /* Right Column: Lead Form Card */
            <div
              className="flex flex-col bg-white rounded-[10px] sm:rounded-[20px] w-full lg:max-w-135 p-4 xl:p-7.5 border border-[#D4DFFF]"
              style={{
                backdropFilter: 'blur(0px)',
                boxShadow:
                  '0px 4px 10px 0px #A7B2E236, 0px 18px 18px 0px #A7B2E230, 0px 40px 24px 0px #A7B2E21C, 0px 70px 28px 0px #A7B2E208, 0px 110px 31px 0px #A7B2E200',
              }}
            >
              <h3 className="text-xl md:text-3xl leading-[120%] tracking-[-0.01em] font-medium text-lightgray mb-4 lg:mb-6 4xl:mb-9!">
                What are you studying?
              </h3>
              <form className="grow flex flex-col" onSubmit={handleSubmit}>
                <CustomSelect
                  label="Select Board"
                  options={formBoardOptions}
                  selected={formData.board}
                  onSelect={(val: string) =>
                    setFormData({
                      ...formData,
                      board: val,
                      ...(val === 'CUET UG' ? { class: 'XII' } : {}),
                    })
                  }
                  placeholder="Choose board"
                />

                <CustomSelect
                  label="Select Class"
                  options={classOptions}
                  selected={formData.class}
                  onSelect={(val: string) =>
                    setFormData({ ...formData, class: val })
                  }
                  placeholder="Choose class"
                />

                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-lg 4xl:text-xl! text-lightgray mb-1 xl:mb-2 font-medium opacity-50">
                    Your Name
                  </label>
                  <div className="flex items-center w-full border border-slate-200 rounded-full px-3 sm:px-6 py-2 sm:py-3.5 bg-white focus-within:border-blue-500 transition-colors">
                    <input
                      type="text"
                      className="w-full text-sm xl:text-xl text-slate-800 placeholder:text-gray-400 font-medium focus-within:outline-0! focus:outline-0! focus:shadow-white! focus-within:shadow-white! bg-transparent outline-0! border-0! py-0! leading-[120%]"
                      placeholder="Your Full  Name"
                      value={formData.name}
                      onChange={handleNameChange}
                    />
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-lg 4xl:text-xl! text-lightgray mb-1 xl:mb-2 font-medium opacity-50">
                    Phone Number
                  </label>
                  <div className="flex items-center w-full border border-slate-200 rounded-full px-3 sm:px-6 py-2 sm:py-3.5 bg-white focus-within:border-blue-500 transition-colors">
                    <span className="text-sm mr-2 sm:text-base xl:text-xl font-medium text-lightgray leading-[120%]">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full text-sm xl:text-xl text-slate-800 font-medium bg-transparent outline-none border-0 py-0 leading-[120%]"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </div>
                <div className="grow flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="primary-btn text-sm sm:tex-lg md:text-xl font-medium leading-[120%] py-2 sm:py-4 w-full disabled:opacity-60"
                  >
                    {submitting ? 'Please wait...' : 'Start Learning'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
