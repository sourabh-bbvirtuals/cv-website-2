import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2, Check } from 'lucide-react';
import {
  useBoardSelection,
  type BoardOption,
} from '~/context/BoardSelectionContext';

const BoardDropdown = ({
  isMobile = false,
  showAll = false,
  savedBoard,
  savedClass,
}: {
  isMobile?: boolean;
  showAll?: boolean;
  savedBoard?: string | null;
  savedClass?: string | null;
}) => {
  console.log('Saved Board:', savedBoard, 'Saved Class:', savedClass);
  const { selectedSlug, boardOptions, setSelectedBoard } = useBoardSelection();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = showAll
    ? selectedSlug
      ? boardOptions.find((o) => o.slug === selectedSlug)
      : null
    : // First check if user just selected something via context
      boardOptions.find((o) => o.slug === selectedSlug) ||
      // Then try to find board option matching saved preferences
      boardOptions.find((o) => {
        if (!savedBoard || !savedClass) return false;
        // Extract number from savedClass (e.g., "11th" -> "11")
        const classNumber = savedClass.replace(/\D/g, '');
        // Extract number from option class (e.g., "Class 11" -> "11")
        const optionClassNumber = o.class.replace(/\D/g, '');
        // Match board directly and class by number
        return o.board === savedBoard && classNumber === optionClassNumber;
      }) ||
      boardOptions[0] || {
        class: 'Class 12',
        board: 'MH',
        slug: '',
        label: '',
      };

  console.log('Selected Board Option:', selected);

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

  const isSavedSelection = (item: BoardOption) => {
    if (!savedBoard || !savedClass) return false;
    // Extract number from savedClass (e.g., "11th" -> "11")
    const classNumber = savedClass.replace(/\D/g, '');
    // Extract number from option class (e.g., "Class 11" -> "11")
    const optionClassNumber = item.class.replace(/\D/g, '');
    // Match board directly and class by number
    return item.board === savedBoard && classNumber === optionClassNumber;
  };

  const handleSelect = async (item: BoardOption) => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const response = await fetch('/api/update-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: item.board,
          studentClass: item.class,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      setSelectedBoard(item.slug);
      setUpdateMessage({
        type: 'success',
        text: `${item.class} • ${item.board} Board saved!`,
      });

      // Clear message after 2 seconds
      setTimeout(() => {
        setUpdateMessage(null);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      setUpdateMessage({
        type: 'error',
        text: 'Failed to save preferences. Try again.',
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (boardOptions.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {!isMobile ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border relative z-20 border-gray-200 rounded-full px-5 py-[11px] text-[#081627] text-base font-medium bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          {selected ? (
            <>
              <span>{selected.class}</span>
              <span className="text-gray-300 mx-1">&bull;</span>
              <span>{selected.board}</span>
            </>
          ) : (
            <span>All Boards</span>
          )}
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
              {selected
                ? `${selected.class} \u2022 ${selected.board} Board`
                : 'All Boards'}
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
          {/* {updateMessage && (
            <div
              className={`mx-3 mb-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                updateMessage.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {updateMessage.type === 'success' ? (
                <Check size={16} />
              ) : (
                <span>✕</span>
              )}
              {updateMessage.text}
            </div>
          )} */}
          {showAll && (
            <button
              onClick={() => {
                setSelectedBoard('');
                setIsOpen(false);
              }}
              className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold text-[#081627]">All Boards</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  !selectedSlug ? 'bg-blue-500' : 'bg-transparent'
                }`}
              />
            </button>
          )}
          {boardOptions.map((item) => {
            const isSaved = isSavedSelection(item);
            const isCurrentlySelected = selectedSlug === item.slug;

            return (
              <button
                key={item.slug}
                onClick={() => handleSelect(item)}
                disabled={isUpdating}
                className={`w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group ${
                  isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[#081627]">
                    {item.class} &bull; {item.board} Board
                  </span>
                  {/* {isSaved && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Saved
                    </span>
                  )} */}
                </div>
                <div className="flex items-center gap-2">
                  {isUpdating && isCurrentlySelected && (
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                  )}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCurrentlySelected ? 'bg-blue-500' : 'bg-transparent'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardDropdown;
