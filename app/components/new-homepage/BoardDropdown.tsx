import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  useBoardSelection,
  type BoardOption,
} from '~/context/BoardSelectionContext';

const BoardDropdown = ({ isMobile = false }) => {
  const { selectedSlug, boardOptions, setSelectedBoard } = useBoardSelection();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = boardOptions.find((o) => o.slug === selectedSlug) ||
    boardOptions[0] || { class: 'Class 12', board: 'MH', slug: '', label: '' };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: BoardOption) => {
    setSelectedBoard(item.slug);
    setIsOpen(false);
  };

  if (boardOptions.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {!isMobile ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border relative z-20 border-gray-200 rounded-full px-5 py-[11px] text-[#081627] text-base font-medium bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <span>{selected.class}</span>
          <span className="text-gray-300 mx-1">&bull;</span>
          <span>{selected.board}</span>
          <ChevronDown
            size={16}
            className={`text-[#081627] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#f8faff] border border-[#e5edff] rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wider text-blue-500 font-bold">
              SELECTED BOARD
            </span>
            <span className="font-bold text-[#081627] text-lg">
              {selected.class} &bull; {selected.board} Board
            </span>
          </div>
          <ChevronDown size={20} className="text-blue-600" />
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute top-[120%] z-20 ${
            isMobile ? 'left-0' : 'right-0 lg:left-0'
          } w-full min-w-[280px] bg-white border border-gray-100 shadow-2xl rounded-2xl py-3 z-[100] animate-in fade-in slide-in-from-top-2`}
        >
          <div className="px-5 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Select your Board
          </div>
          {boardOptions.map((item) => (
            <button
              key={item.slug}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold text-[#081627]">
                {item.class} &bull; {item.board} Board
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  selectedSlug === item.slug ? 'bg-blue-500' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardDropdown;
