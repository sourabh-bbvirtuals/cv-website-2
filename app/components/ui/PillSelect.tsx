import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/react-dom';

interface PillSelectProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  closeAllPillSelects?: () => void;
  /** 'right' aligns the dropdown's right edge to the button's right edge (default).
   *  'left' aligns the dropdown's left edge to the button's left edge. */
  align?: 'left' | 'right';
}

export function PillSelect({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  closeAllPillSelects,
  align = 'right',
}: PillSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { x, y, strategy, refs } = useFloating({
    placement: align === 'left' ? 'bottom-start' : 'bottom-end',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        refs.floating.current &&
        !refs.floating.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, refs.floating]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="h-fit shrink-0">
      {/* Trigger Button */}
      <button
        ref={refs.setReference}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base font-medium leading-[150%] transition-colors whitespace-nowrap ${
          isOpen
            ? 'bg-lightgray text-white border-lightgray'
            : 'border-[rgba(8,22,39,0.1)] bg-white text-lightgray/70 hover:bg-lightgray/5'
        }`}
      >
        <span>{value || placeholder}</span>
        <svg
          className={`size-3.5 sm:size-4 shrink-0 transition-transform duration-200 ${
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

      {/* Dropdown via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
            }}
            className="z-[9999] min-w-[180px] max-w-xs rounded-xl border border-[rgba(8,22,39,0.1)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden"
            role="listbox"
          >
            <div className="max-h-[300px] overflow-y-auto">
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
          </div>,
          document.body,
        )}
    </div>
  );
}
