import React, { useState, useRef, useEffect, RefObject } from 'react';

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
    <div className="mb-3 xl:mb-6 relative" ref={ref}>
      <label className="block text-xs sm:text-lg 4xl:text-xl! text-lightgray mb-1 xl:mb-2 font-medium opacity-50">
        {label}
      </label>
      <div
        className="flex items-center justify-between w-full border border-[#0816271A] rounded-full px-3 sm:px-6 py-2 sm:py-3.5 bg-white cursor-pointer hover:border-slate-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`text-sm sm:text-base 4xl:text-xl! font-medium leading-[120%] ${
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg py-2 max-h-48 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors font-medium"
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
    class: '12th',
    board: 'CBSE',
    name: '',
    phone: '',
  });

  const classOptions: string[] = ['11th', '12th', 'CA Foundation', 'CUET'];
  const boardOptions: string[] = ['CBSE', 'ICSE', 'State Board'];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log(formData);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  return (
    <section className="bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center relative">
      <div className="custom-container pb-10 lg:pb-12 4xl:pb-28! pt-32.5 md:pt-57.5 xl:pt-65.75 w-full">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-4">
          {/* Left Column: Content & Stats */}
          <div
            className={`w-full sm:p-4 xl:p-12 rounded-3xl max-sm:bg-none! text-center flex flex-col items-center sm:text-left sm:items-start ${
              isLoggedIn
                ? 'lg:max-w-none text-center flex flex-col items-center'
                : ''
            }`}
            style={{
              background: isLoggedIn
                ? 'rgba(255, 255, 255, 0.85)'
                : 'linear-gradient(to left, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)',
              backdropFilter: isLoggedIn ? 'blur(10px)' : 'none',
              border: isLoggedIn
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : 'none',
            }}
          >
            {/* card content */}
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center sm:items-start sm:justify-start">
                {/* Pill Tag */}
                <div className="inline-flex items-center gap-2 px-4 leading-[120%] py-1.5 rounded-full bg-[#0816270D] text-xs  sm:text-base font-medium text-gray-700 mb-3 xl:mb-6 border border-[#0816270D]">
                  <span>MH Board</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>CBSE</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                  <span>CUET</span>
                </div>

                {/* Headline */}
                <h1 className="text-2xl md:text-3xl xl:text-6xl font-semibold mb-2 sm:mb-4 leading-[100%]">
                  Commerce made <br className="max-sm:hidden" /> clear.
                </h1>

                {/* Subheadline */}
                <p className="text-sm sm:text-base xl:text-xl text-lightgray mb-3 sm:mb-8 xl:mb-12 leading-[150%] max-w-lg">
                  Free videos, notes, formula cards, and past papers for Class
                  11-12, CA Foundation, and CUET - all in one place.
                </p>

                {/* CTA Button */}
                <div className="flex justify-center w-full sm:justify-start">
                  <button className="flex items-center gap-1 sm:gap-3 bg-white hover:bg-slate-50 text-gray-700 font-medium px-4 py-2 sm:py-3 leading-[120%] rounded-full transition-all mb-5 sm:mb-8 4xl:mb-12! border border-[#0816271A] text-xs sm:text-base lg:text-lg 4xl:text-xl!">
                    <svg
                      className="max-sm:max-w-4 h-auto"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.5 12.0005C22.5006 12.2551 22.4353 12.5056 22.3105 12.7275C22.1856 12.9495 22.0055 13.1353 21.7875 13.267L8.28 21.5302C8.05227 21.6696 7.79144 21.7457 7.52445 21.7507C7.25746 21.7556 6.99399 21.6892 6.76125 21.5583C6.53073 21.4294 6.3387 21.2414 6.2049 21.0137C6.07111 20.786 6.00039 20.5268 6 20.2627V3.73828C6.00039 3.47417 6.07111 3.21493 6.2049 2.98722C6.3387 2.75951 6.53073 2.57155 6.76125 2.44266C6.99399 2.31173 7.25746 2.24531 7.52445 2.25026C7.79144 2.2552 8.05227 2.33133 8.28 2.47078L21.7875 10.7339C22.0055 10.8656 22.1856 11.0515 22.3105 11.2734C22.4353 11.4953 22.5006 11.7458 22.5 12.0005Z"
                        fill="#374151"
                      />
                    </svg>
                    <span>Watch Free Demo</span>
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div
                className={`grid grid-cols-2 xl:grid-cols-4 gap-6 whitespace-nowrap pt-8 sm:pt-12 xl:pt-2 justify-center sm:justify-start ${
                  isLoggedIn ? 'w-full' : ''
                }`}
              >
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Enrolled Students
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    50,000+
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-800 leading-[150%] mb-2 xl:mb-3">
                    Free Resources
                  </p>
                  <p className="score-text text-lg sm:text-xl md:text-2xl font-semibold text-black">
                    2400+
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
                    30+
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
              <h3 className="text-xl :md:text-3xl leading-[120%] font-medium text-lightgray mb-4 lg:mb-6 4xl:mb-9!">
                What are you studying?
              </h3>
              <form className="grow flex flex-col" onSubmit={handleSubmit}>
                <CustomSelect
                  label="Select Board"
                  options={boardOptions}
                  selected={formData.board}
                  onSelect={(val: string) =>
                    setFormData({ ...formData, board: val })
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
                    <span className="text-sm sm:text-base xl:text-xl font-medium text-lightgray leading-[120%]">
                      +91
                    </span>
                    <input
                      type="tel"
                      className="w-full text-sm xl:text-xl text-slate-800 font-medium focus-within:outline-0! focus:outline-0! focus:shadow-white! focus-within:shadow-white! bg-transparent placeholder-slate-300 outline-0! border-0! py-0! leading-[120%]"
                      placeholder=""
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </div>
                <div className="grow flex items-end">
                  <button
                    type="submit"
                    className="primary-btn text-sm sm:tex-lg md:text-xl font-medium leading-[120%] py-2 sm:py-4 w-full"
                  >
                    Start Learning
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
