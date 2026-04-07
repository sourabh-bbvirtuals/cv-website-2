import { useRef, useState, useEffect } from 'react';

interface PillSelectProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * PillSelect — Dropdown filter component styled as a pill/chip
 * Used for filtering across multiple dimensions (subject, board, difficulty, etc.)
 */
export function PillSelect({
  value,
  options,
  onChange,
  placeholder = 'Select...',
}: PillSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative h-fit shrink-0">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base font-medium leading-[150%] transition-colors whitespace-nowrap ${
          isOpen
            ? 'bg-lightgray text-white border-lightgray'
            : 'border-[rgba(8,22,39,0.1)] bg-white text-lightgray/70 hover:bg-lightgray/5'
        }`}
      >
        <span className="line-clamp-1">{value || placeholder}</span>
        {/* Chevron Icon */}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden sm:absolute sm:top-full sm:left-0 sm:mt-1.5 sm:w-38 sm:translate-x-0 sm:translate-y-0"
          role="listbox"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={value === option}
              className={`w-full px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm lg:text-base font-medium leading-[150%] transition-colors ${
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
