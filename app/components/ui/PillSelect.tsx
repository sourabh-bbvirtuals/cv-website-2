import { useEffect, useRef, useState } from 'react';

interface PillSelectProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  closeAllPillSelects?: () => void;
}

export function PillSelect({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  closeAllPillSelects,
}: PillSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Detect window size for mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close dropdown on vertical scroll or horizontal scroll
  useEffect(() => {
    function handleScroll() {
      if (isOpen) {
        setIsOpen(false);
        closeAllPillSelects?.();
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, closeAllPillSelects]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative h-fit shrink-0">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base font-medium leading-[150%] transition-colors whitespace-nowrap ${
          isOpen
            ? 'bg-lightgray text-white border-lightgray'
            : 'border-[rgba(8,22,39,0.1)] bg-white text-lightgray/70 hover:bg-lightgray/5'
        }`}
      >
        <span className="line-clamp-1">{value || placeholder}</span>
        <svg
          className={`size-3.5 sm:size-4 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu - now fixed with dynamic position */}
      {isOpen && (
        <div
          className="fixed z-[9999] mt-2 w-40 rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden"
          style={
            isMobile
              ? {
                  top: `50px`,
                  left: `100px`,
                }
              : {}
          }
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option}
              className={`w-full px-4 py-2 sm:py-2.5 text-left text-sm lg:text-base font-medium leading-[150%] transition-colors ${
                value === option
                  ? 'bg-lightgray/5 text-lightgray'
                  : 'text-lightgray/70 hover:bg-lightgray/5 hover:text-lightgray'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
