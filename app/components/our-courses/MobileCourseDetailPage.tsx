import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Phone,
  User,
  CircleHelp,
  MessageSquare,
  CirclePlay,
  ClipboardList,
  Pencil,
  CheckCircle2,
  Loader2,
  Info,
  CircleUserRound,
  ListChecks,
  MessageSquareMore,
  NotepadText,
  PencilLine,
  Dot,
  ArrowLeft,
} from 'lucide-react';
import parse from 'html-react-parser';
import { Link, useFetcher, useNavigate } from '@remix-run/react';

import {
  ProductData,
  SpecItem,
  IncludedProduct,
  CourseDetailPageProps,
  CustomDropdownProps,
  MOCK_PRODUCT,
  MOCK_SPECIFICATIONS,
  NAV_MAP,
  SUBNAV_SCROLL_SPY_OFFSET_PX,
} from './CourseDetailPage';

function CustomDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-full border text-white border-white/20 bg-white/10 text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#3a6bfc] focus:border-transparent transition-all hover:border-slate-300 flex items-center justify-between"
      >
        <span className={selectedOption ? '' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`size-5 text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="max-h-80 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3 text-left text-base font-medium transition-colors flex items-center justify-between gap-3 ${
                  value === option.value
                    ? 'bg-blue-50 text-[#3a6bfc]'
                    : 'text-[#081627] hover:bg-slate-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#3a6bfc]">
                    <svg
                      className="size-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomDropdown2({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-black/50 mb-1">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-full border text-lightgray border-black/20 bg-white/10 text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#3a6bfc] focus:border-transparent transition-all hover:border-slate-300 flex items-center justify-between"
      >
        <span className={selectedOption ? '' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`size-5 text-lightgray transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-3 left-0 right-0 -translate-y-full z-50 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="max-h-80 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3 text-left text-base font-medium transition-colors flex items-center justify-between gap-3 ${
                  value === option.value
                    ? 'bg-blue-50 text-[#3a6bfc]'
                    : 'text-[#081627] hover:bg-slate-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#3a6bfc]">
                    <svg
                      className="size-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Spec Renderers ───────────────────────────────────────────────────────────
function SpecTable({ table }: { table: Record<string, string> }) {
  return (
    <div className="overflow-x-auto rounded-2xl border my-2 border-[rgba(8,22,39,0.1)]">
      <table className="w-full text-base text-slate-800">
        <tbody>
          {Object.entries(table).map(([key, val]) => (
            <tr
              key={key}
              className="border-b border-[rgba(8,22,39,0.06)] last:border-0"
            >
              <td className="px-4 py-3 font-medium text-slate-500 w-1/2 bg-slate-50/50">
                {key}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-900">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpecList({ list }: { list: string[] }) {
  return (
    <div className="flex flex-col w-full">
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-1 py-0 w-full">
          <div className="flex size-8 shrink-0 items-center justify-center text-lightgray/50 rounded-full">
            <Dot className="size-[22px] stroke-[1.5]" />
          </div>
          <span className="text-base text-lightgray/90 text-left">{item}</span>
        </div>
      ))}
    </div>
  );
}

function SpecHtml({ text }: { text: string }) {
  return (
    <div className="prose prose-sm sm:prose max-w-none text-slate-800 leading-relaxed">
      {parse(text)}
    </div>
  );
}

function SpecStats({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 my-2 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-lightgray/10 text-center"
        >
          <p className="text-2xl sm:text-3xl font-black text-[#3a6bfc]">
            {stat.value}
          </p>
          <p className="text-xs font-bold text-lightgray/90 uppercase tracking-widest mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function FaqSection({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div
            key={i}
            className="flex gap-4 border-b mx-4 pb-2 border-black/10 px-4 "
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-slate-800">
                  {item.question}
                </p>
                {/* CHEVRON */}
                <div className="shrink-0 flex items-center justify-center p-0.5 bg-lightgray/5 rounded-full">
                  {open ? (
                    <ChevronDown className="size-4 text-lightgray/50" />
                  ) : (
                    <ChevronRight className="size-4 text-lightgray/50" />
                  )}
                </div>
              </div>

              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 text-sm leading-relaxed text-lightgray">
                    {item.answer}
                  </p>
                </div>
              </div>
            </button>
            {/* <button
              type="button"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-lightgray/50 self-start mt-0.5"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <ChevronDown
                className={`size-4 transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button> */}
          </div>
        );
      })}
    </div>
  );
}

type VideoItem = {
  url: string;
  title: string;
  durationMinutes: number;
};

export function VideoCarousel({ items }: { items: VideoItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Utilities
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  // Scroll by buttons
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Update current index on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPos = scrollRef.current.scrollLeft;
    const containerWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollPos / containerWidth);
    setCurrentIndex(Math.min(newIndex, items.length - 1));
  };

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;

    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const walk = e.clientX - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    // Snap to nearest slide
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollRef.current.scrollLeft / width);
    scrollRef.current.scrollTo({
      left: newIndex * width,
      behavior: 'smooth',
    });
    setCurrentIndex(Math.min(newIndex, items.length - 1));
  };

  // Prevent accidental clicks while dragging
  const onClick = (e: React.MouseEvent) => {
    if (isDragging.current) e.preventDefault();
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="relative group">
      {/* Carousel viewport */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide cursor-grab"
        onMouseDown={onMouseDown}
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, i) => {
          const vid = getYouTubeId(item.url);
          const thumb = vid
            ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg`
            : null;

          return (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              className="flex-shrink-0 w-full snap-start px-4"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-900 shadow-md">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-80 transition-opacity duration-300 hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Play className="size-10 text-white/50" />
                  </div>
                )}

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute left-1/2 top-1/2 flex h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20">
                    <Play fill="#FFFFFF" className="w-6 text-white" />
                  </div>
                </div>

                {/* Duration */}
                {item.durationMinutes > 0 && (
                  <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-white/15 bg-white/15 px-2 py-1 text-sm font-medium text-white backdrop-blur-[17px]">
                    {item.durationMinutes}m
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 px-1 flex flex-col gap-2">
                <p className="text-xs font-medium text-lightgray/50 tracking-[2px] uppercase">
                  CHAPTER {i + 1}
                </p>
                <h3 className="line-clamp-2 text-lg font-medium text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>
            </a>
          );
        })}
      </div>

      {/* Page Indicators */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 mb-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (scrollRef.current) {
                  const width = scrollRef.current.offsetWidth;
                  scrollRef.current.scrollTo({
                    left: i * width,
                    behavior: 'smooth',
                  });
                  setCurrentIndex(i);
                }
              }}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'w-6 bg-slate-400'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="hidden items-center justify-center gap-3">
        <button
          onClick={() => scroll('left')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 hover:border-slate-300 active:scale-95"
        >
          <ChevronLeft className="w-5 text-slate-500" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 hover:border-slate-300 active:scale-95"
        >
          <ChevronRight className="w-5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}

function FacultiesCarousel({
  items,
}: {
  items: Array<{ name: string; image: string; description: string; designation?: string; experience?: string }>;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [clampedItems, setClampedItems] = useState<Set<number>>(new Set());
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const ITEMS_PER_PAGE = 2;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const checkIfClamped = useCallback(() => {
    const newClampedItems = new Set<number>();
    textRefs.current.forEach((ref, idx) => {
      if (ref && ref.scrollHeight > ref.clientHeight) {
        newClampedItems.add(idx);
      }
    });
    setClampedItems(newClampedItems);
  }, []);

  useEffect(() => {
    checkIfClamped();
    window.addEventListener('resize', checkIfClamped);
    return () => window.removeEventListener('resize', checkIfClamped);
  }, [checkIfClamped]);

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    setExpandedIdx(null);
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    setExpandedIdx(null);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group px-8">
      {/* Navigation Arrows positioned to align with the section title above */}

      {/* Two-column grid layout */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {currentItems.map((faculty, idx) => {
          const absoluteIdx = currentPage * ITEMS_PER_PAGE + idx;
          const isExpanded = expandedIdx === absoluteIdx;
          const isClamped = clampedItems.has(absoluteIdx);
          return (
            <div key={absoluteIdx} className="flex flex-col gap-4">
              {/* Header: Avatar + Name/Subtitle */}
              <div className="flex gap-4 items-center">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-slate-100 shadow-md flex-shrink-0">
                  <img
                    src={faculty.image}
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start gap-1 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {faculty.name}
                  </h3>
                  {faculty.designation && (
                    <p className="text-sm text-gray-500">{faculty.designation}</p>
                  )}
                  {faculty.experience && (
                    <p className="text-sm text-gray-400">{faculty.experience}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 w-full text-base text-lightgray/50 leading-relaxed flex-1">
                {isExpanded ? (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: faculty.description }} />
                    <button
                      onClick={() => setExpandedIdx(null)}
                      className="font-medium text-[#3a6bfc] hover:underline flex items-center gap-1 w-fit"
                    >
                      Show Less
                      <ChevronDown className="size-4 rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      ref={(el) => {
                        textRefs.current[absoluteIdx] = el;
                      }}
                      className="line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: faculty.description }}
                    />
                    {isClamped && (
                      <button
                        onClick={() => setExpandedIdx(absoluteIdx)}
                        className="font-medium text-[#3a6bfc] hover:underline flex items-center gap-1 w-fit"
                      >
                        Show More
                        <ChevronDown className="size-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i);
                setExpandedIdx(null);
              }}
              className={`h-2 rounded-full transition-all ${
                i === currentPage
                  ? 'w-6 bg-gray-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="mt-4 items-center justify-center gap-3 flex">
        <button
          onClick={goToPrevious}
          disabled={totalPages <= 1}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-5 text-slate-500" />
        </button>
        <button
          onClick={goToNext}
          disabled={totalPages <= 1}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="size-5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}

function ContactSupport({
  detail,
}: {
  detail: {
    title: string;
    description: string;
    buttonText: string;
    url: string;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 sm:px-8 w-full">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
        {detail.title}
      </h3>
      <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
        {detail.description}
      </p>
      <a
        href={detail.url}
        className="primary-btn flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-transform active:scale-95 shadow-lg shadow-blue-500/20 w-fit"
      >
        <Phone className="size-5" />
        {detail.buttonText}
      </a>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-6 flex items-center gap-4">
      <h2 className="text-sm w-full max-w-max font-medium text-gray-500 uppercase tracking-[1px] whitespace-nowrap">
        {title}
      </h2>
      <div className="w-full border border-black/5" />
    </div>
  );
}

/** Render a "composite" block — may contain nested tables, lists, html, or more composites */
function CompositeBlock({
  item,
  depth = 0,
}: {
  item: SpecItem;
  depth?: number;
}) {
  const children = item.data || [];
  if (children.length === 0) return null;

  return (
    <div className={`space-y-6 ${depth > 0 ? 'mt-4' : ''}`}>
      {item.name && depth > 0 && (
        <h4
          className={`font-bold text-slate-800 ${
            depth === 1 ? 'text-xl' : 'text-lg'
          }`}
        >
          {item.name}
        </h4>
      )}
      <div className="grid">
        {children.map((child, i) => (
          <SpecBlock key={i} item={child} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

/** Route a spec item to the right renderer */
function SpecBlock({ item, depth = 0 }: { item: SpecItem; depth?: number }) {
  if (item.type === 'table' && item.table)
    return <SpecTable table={item.table} />;
  if (item.type === 'list' && item.list) return <SpecList list={item.list} />;
  if (
    item.type === 'html' ||
    item.type === 'text' ||
    item.type === 'html_text'
  ) {
    const text = item.text || '';
    if (!text) return null;
    return <SpecHtml text={text} />;
  }
  if (item.type === 'video' && item.text) {
    return (
      <a
        href={item.text}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 group relative w-full"
      >
        <div className="flex size-8 shrink-0 items-center justify-center text-[#3a6bfc] group-hover:bg-[#3a6bfc]/10 rounded-full transition-colors">
          <CirclePlay className="size-[22px] stroke-[1.5]" />
        </div>
        <span className="text-sm sm:text-base font-normal text-[#081627] group-hover:text-[#3a6bfc] transition-colors text-left">
          {item.name}
        </span>
      </a>
    );
  }
  if (item.type === 'composite' && item.data) {
    return <CompositeBlock item={item} depth={depth} />;
  }
  if (item.type === 'faq' && item.faqItems)
    return <FaqSection items={item.faqItems} />;
  if (item.type === 'video_carousel' && item.videoItems)
    return <VideoCarousel items={item.videoItems} />;
  if (item.type === 'contact_support' && item.contactSupportDetail) {
    // Handled specifically at the bottom of the page in its own full-width section.
    return null;
  }
  if (item.type === 'stat_items' && item.statItems) {
    return <SpecStats stats={item.statItems} />;
  }
  return null;
}

function FeaturesSection({ specItems }: { specItems: SpecItem[] }) {
  const featuresSpec = specItems.find((s) => s.identifier === 'features');
  if (!featuresSpec) return null;

  const whatsIncluded = featuresSpec.data?.find((d) => d.type === 'table');
  const courseHighlights = featuresSpec.data?.find((d) => d.type === 'list');

  const includedEntries = whatsIncluded?.table
    ? Object.entries(whatsIncluded.table)
    : [];
  const highlights = courseHighlights?.list || [];

  return (
    <div className="p-0 w-full border border-black/5 overflow-hidden">
      {includedEntries.length > 0 && (
        <div className="grid grid-cols-2">
          {includedEntries.map(([label, value], i) => {
            const cols = 2;
            const rowIndex = Math.floor(i / cols);
            const totalRows = Math.ceil(includedEntries.length / cols);

            const isLastCol = (i + 1) % cols === 0;
            const isLastRow = rowIndex === totalRows - 1;

            return (
              <div
                key={label}
                className={`
              flex flex-col gap-2 justify-center px-4 py-4
              border-b border-r border-black/5
              ${isLastCol ? 'border-r-0' : ''}
              ${isLastRow ? 'border-b-0' : ''}
            `}
              >
                <p className="text-xs  tracking-[1px] font-medium uppercase text-gray-400">
                  {label}
                </p>
                <p className="text-base text-lightgray font-medium leading-tight">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HighlightsSection({ specItems }: { specItems: SpecItem[] }) {
  const featuresSpec = specItems.find((s) => s.identifier === 'features');
  if (!featuresSpec) return null;

  const courseHighlightsList = featuresSpec.data?.find(
    (d) => d.type === 'list',
  );
  const courseHighlightsIcons = featuresSpec.data?.find(
    (d) => d.type === 'icon_with_text' && d.iconWithTextItems?.length,
  );

  const highlights: Array<{ text: string; iconUrl?: string }> =
    courseHighlightsList?.list?.map((t) => ({ text: t })) ||
    courseHighlightsIcons?.iconWithTextItems?.map((item) => ({
      text: item.text,
      iconUrl: item.iconUrl,
    })) ||
    [];

  return (
    <div className="px-6 overflow-hidden relative w-full">
      <div className="relative z-10 flex flex-col lg:flex-row gap-5">
        {highlights.length > 0 && (
          <div className="flex-1 flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {highlights.map((item, i) => {
                const t = item.text.toLowerCase();
                let Icon = CheckCircle2;
                let color = '#22C55E';

                if (
                  t.includes('master teacher') ||
                  t.includes('live classes')
                ) {
                  Icon = CircleUserRound;
                  color = '#E05A5A';
                } else if (t.includes('quiz')) {
                  Icon = ListChecks;
                  color = '#22C55E';
                } else if (t.includes('doubt')) {
                  Icon = MessageSquareMore;
                  color = '#EC4899';
                } else if (t.includes('recording')) {
                  Icon = CirclePlay;
                  color = '#F97316';
                } else if (t.includes('assignment') || t.includes('note')) {
                  Icon = NotepadText;
                  color = '#3B82F6';
                } else if (t.includes('handwritten')) {
                  Icon = PencilLine;
                  color = '#EF4444';
                }

                return (
                  <li key={i} className="flex items-start gap-3">
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt=""
                        className="size-6 shrink-0 rounded-full object-contain"
                      />
                    ) : (
                      <Icon
                        className="p-[3px] size-6 border shrink-0 rounded-full"
                        style={{
                          borderColor: `${color}33`,
                          backgroundColor: `${color}33`,
                          color: color,
                        }}
                        strokeWidth={1.5}
                      />
                    )}
                    <span className="text-[15px] leading-relaxed">
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function RenderSyllabus({ item }: { item: SpecItem }) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const data = item.data || [];

  if (data.length === 0)
    return <p className="text-slate-500 italic">No syllabus data available</p>;
  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col gap-4 relative">
        {/* Subtle vertical connector line connecting numbers */}
        <div className="absolute left-[13px] top-[40px] bottom-[40px] w-px bg-slate-200 block" />

        {data.map((child, idx) => {
          const open = openAccordion === idx;
          const lectureCount =
            parseInt(child.extraFields?.no_of_lectures || '0', 10) ||
            parseInt(child.extraFields?.num_lectures || '0', 10) ||
            child.data?.length ||
            child.list?.length ||
            child.videoItems?.length ||
            0;
          const durationRaw =
            child.extraFields?.duration ||
            child.extraFields?.duration_minutes ||
            '';
          const durationLabel = (() => {
            const hmsMatch = durationRaw.match(/^(\d+):(\d+)(?::(\d+))?$/);
            if (hmsMatch) {
              const h = parseInt(hmsMatch[1], 10);
              const m = parseInt(hmsMatch[2], 10);
              const parts: string[] = [];
              if (h > 0) parts.push(`${h}h`);
              if (m > 0) parts.push(`${m}m`);
              return parts.join(' ') || '';
            }
            const mins = parseInt(durationRaw, 10);
            if (mins > 0) {
              return mins >= 60
                ? `${Math.floor(mins / 60)}h ${
                    mins % 60 ? `${mins % 60}m` : ''
                  }`.trim()
                : `${mins}m`;
            }
            return '';
          })();

          return (
            <div
              key={idx}
              className="flex flex-row gap-2 w-full items-start relative z-10"
            >
              {/* Outer Number Circle */}
              <div className="flex shrink-0 pt-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-[13px] font-medium  border  ${
                    open
                      ? 'bg-[#0f172a] text-white'
                      : 'bg-gray-100 border-gray-300 text-lightgray/50'
                  }`}
                >
                  {idx + 1}
                </span>
              </div>

              {/* The Interactive Card */}
              <div
                className={`flex-1 rounded-2xl p-3 gap-4 bg-[#F5F6F9B2] overflow-hidden transition-all ${
                  open ? 'shadow-[0_4px_24px_rgba(0,0,0,0.04)]' : ''
                } w-full`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 text-left"
                  onClick={() => setOpenAccordion(open ? null : idx)}
                >
                  {/* LEFT CONTENT */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {/* BADGES */}
                    <div className="flex items-center gap-1.5">
                      {lectureCount > 0 && (
                        <span className="text-[11px] font-medium text-lightgray bg-white border border-slate-200 rounded-full tracking-tight w-fit px-2 py-0.5 shadow-xs">
                          {lectureCount} Lectures
                        </span>
                      )}
                      {durationLabel && (
                        <span className="text-[11px] font-medium text-lightgray bg-white border border-slate-200 rounded-full tracking-tight w-fit px-2 py-0.5 shadow-xs">
                          {durationLabel}
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <span className="font-medium text-base sm:text-lg text-lightgray leading-snug">
                      {child.name}
                    </span>
                  </div>

                  {/* CHEVRON */}
                  <div className="shrink-0 flex items-center justify-center p-0.5 bg-lightgray/5 rounded-full">
                    {open ? (
                      <ChevronDown className="size-4 text-lightgray/50" />
                    ) : (
                      <ChevronRight className="size-4 text-lightgray/50" />
                    )}
                  </div>
                </button>
                {/* specification blocks */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out mt-2 ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="">
                      <div className="flex flex-col gap-1">
                        <SpecBlock item={child} depth={0} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SyllabusSection({ item }: { item: SpecItem }) {
  const subjects = item.data || [];
  const [activeTab, setActiveTab] = useState(0);

  if (subjects.length === 0)
    return <p className="text-slate-500">No syllabus contents</p>;

  const activeSubject = subjects[activeTab];

  return (
    <div className="space-y-4">
      {subjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto px-4 scrollbar-hide">
          {subjects.map((subj, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 rounded-full font-medium border px-3 py-1 text-sm transition-all ${
                activeTab === i
                  ? 'text-[#3A6BFC] shadow-[0_2px_8px_rgba(58,107,252,0.08)] border-[#3A6BFC]/20 bg-[#3A6BFC1A]/30'
                  : 'bg-white text-lightgray/60 border-lightgray/5 hover:text-lightgray/80 hover:bg-lightgray/5'
              }`}
            >
              {subj.name}
            </button>
          ))}
        </div>
      )}
      {activeSubject && <RenderSyllabus item={activeSubject} />}
    </div>
  );
}

function IncludedProductTabs({
  products,
  activeIndex,
  onChange,
}: {
  products: IncludedProduct[];
  activeIndex: number;
  onChange: (idx: number) => void;
}) {
  if (products.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4">
      {products.map((p, i) => (
        <button
          key={p.bbvProductId}
          type="button"
          onClick={() => onChange(i)}
          className={`rounded-full font-medium transition-all border px-3 py-1.5 text-xs leading-[150%] ${
            i === activeIndex
              ? 'text-[#3A6BFC] shadow-[0_2px_8px_rgba(58,107,252,0.08)] border-[#3A6BFC]/20 bg-[#3A6BFC1A]/30'
              : 'bg-white text-lightgray/60 border-lightgray/5 hover:text-lightgray/60 hover:bg-lightgray/5'
          }`}
        >
          {p.productName}
        </button>
      ))}
    </div>
  );
}

// ─── Variant Option Selector (Mobile) ─────────────────────────────────────────
function VariantOptionSelector({
  optionGroups,
  selectedOptions,
  onSelect,
  light = false,
}: {
  optionGroups: NonNullable<
    NonNullable<CourseDetailPageProps['product']>['optionGroups']
  >;
  selectedOptions: Record<string, string>;
  onSelect: (groupId: string, optionId: string) => void;
  light?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {optionGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              light ? 'text-white/50' : 'text-slate-400'
            }`}
          >
            {group.name}
          </label>
          <div className="relative">
            <select
              value={selectedOptions[group.id] || ''}
              onChange={(e) => onSelect(group.id, e.target.value)}
              className={`appearance-none rounded-full border px-3 py-2 pr-8 text-sm font-medium outline-none transition-colors ${
                light
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC]/20'
              }`}
            >
              {group.options.map((option) => (
                <option key={option.id} value={option.id} className="text-slate-800 bg-white">
                  {option.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${
                light ? 'text-white/50' : 'text-slate-400'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseDetailPage({
  slug,
  product: propProduct,
  specifications: propSpecifications,
}: CourseDetailPageProps) {
  const product = propProduct;
  const specifications = propSpecifications;
  const navigate = useNavigate();
  const addToCartFetcher = useFetcher();
  const isAdding = addToCartFetcher.state !== 'idle';

  const optionGroups = product?.optionGroups ?? [];
  const variants = product?.variants ?? [];
  const hasOptions = optionGroups.length > 0 && variants.length > 1;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    if (!hasOptions) return {};
    const initial: Record<string, string> = {};
    const cheapest = variants.reduce(
      (min, v) => (v.priceWithTax < min.priceWithTax ? v : min),
      variants[0],
    );
    if (cheapest) {
      for (const opt of cheapest.options) {
        if (opt.group) initial[opt.group.id] = opt.id;
      }
    }
    return initial;
  });

  const selectedVariant = hasOptions
    ? variants.find((v) =>
        optionGroups.every((g) =>
          v.options.some((o) => o.id === selectedOptions[g.id]),
        ),
      ) ?? variants[0]
    : variants[0] ?? null;

  const activeVariantId = selectedVariant?.id ?? product?.variantId ?? null;

  const displayPrice = selectedVariant
    ? `₹${(selectedVariant.priceWithTax / 100).toLocaleString('en-IN')}`
    : product?.price || '';
  const displayPriceRaw =
    selectedVariant?.priceWithTax ?? product?.priceWithTax ?? 0;

  const handleOptionSelect = useCallback(
    (groupId: string, optionId: string) => {
      setSelectedOptions((prev) => ({ ...prev, [groupId]: optionId }));
    },
    [],
  );

  const handleEnroll = useCallback(() => {
    if (!activeVariantId) return;
    addToCartFetcher.submit(
      { variantId: activeVariantId, quantity: '1' },
      { method: 'post', action: '/api/enroll' },
    );
  }, [activeVariantId, addToCartFetcher]);

  useEffect(() => {
    if (addToCartFetcher.state === 'idle' && addToCartFetcher.data) {
      const data = addToCartFetcher.data as any;
      if (data?.order) {
        navigate('/cart');
      }
    }
  }, [addToCartFetcher.state, addToCartFetcher.data, navigate]);

  let specItems: SpecItem[] = (specifications?.product || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const includedProducts = specifications?.includedProducts ?? [];
  const isCombo = includedProducts.length > 0;
  const [activeIncludedIdx, setActiveIncludedIdx] = useState(0);
  const activeIncludedSpecs: SpecItem[] = isCombo
    ? includedProducts[activeIncludedIdx]?.specifications ?? []
    : [];

  const courseInfoSpec = specItems.find(
    (s) => s.identifier === 'course_info' || s.name === 'Course Info',
  );

  // Transform and merge stats for the hero bar (e.g. Start Date + End Date)
  const rawStats = courseInfoSpec?.table || {};
  const heroStats: Array<[string, string]> = [];
  const processedKeys = new Set<string>();

  // Order priority for stats if they exist
  const priorityKeys = ['Standard', 'For', 'Board Year'];
  priorityKeys.forEach((k) => {
    if (rawStats[k]) {
      heroStats.push([k, rawStats[k]]);
      processedKeys.add(k);
    }
  });

  // Handle Start-End Date specifically to match Figma
  const startDate = rawStats['Start Date'] || rawStats['Start date'];
  const endDate = rawStats['End Date'] || rawStats['End date'];
  if (startDate || endDate) {
    const combinedDate =
      startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate;
    heroStats.push(['START-END DATE', combinedDate]);
    processedKeys.add('Start Date');
    processedKeys.add('Start date');
    processedKeys.add('End Date');
    processedKeys.add('End date');
  }

  // Add any remaining keys that weren't processed
  Object.entries(rawStats).forEach(([key, val]) => {
    if (!processedKeys.has(key) && !['Language', 'Mode'].includes(key)) {
      heroStats.push([key, val]);
    }
  });

  const facetByGroup = (group: string) =>
    (product?.facetValues ?? [])
      .filter((fv) => fv?.facet?.name?.toLowerCase() === group.toLowerCase())
      .map((fv) => fv.name);

  const courseLanguage =
    facetByGroup('language')[0] ||
    (courseInfoSpec?.table?.['Language'] || '').trim();
  const courseMode =
    facetByGroup('lecture mode')[0] ||
    (courseInfoSpec?.table?.['Mode'] || '').trim();

  const navItems = specItems
    .filter((s) => NAV_MAP[s.identifier])
    .map((s) => ({ id: s.identifier, label: NAV_MAP[s.identifier] || s.name }));

  const [activeNav, setActiveNav] = useState<string>(navItems[0]?.id || '');

  const scrollToSection = useCallback((id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (navItems.length === 0) return;
    const ids = navItems.map((n) => n.id);
    const updateActive = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SUBNAV_SCROLL_SPY_OFFSET_PX) {
          current = id;
        }
      }
      setActiveNav((prev) => (prev === current ? prev : current));
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [navItems.length]);

  const title = product?.title || 'Course Details';
  const description = product?.description || '';
  const facultyImage =
    product?.featuredAsset?.preview || product?.faculties?.[0]?.image;

  const [isWhatsIncludedVisible, setIsWhatsIncludedVisible] = useState(false);
  const whatsIncludedRef = useRef<HTMLDivElement>(null);

  // Track visibility of "what's included" section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWhatsIncludedVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px', // Start detecting before reaching bottom
      },
    );

    if (whatsIncludedRef.current) {
      observer.observe(whatsIncludedRef.current);
    }

    return () => {
      if (whatsIncludedRef.current) {
        observer.unobserve(whatsIncludedRef.current);
      }
    };
  }, []);

  const displayFaculties =
    product?.faculties && product.faculties.length > 0 ? product.faculties : [];

  return (
    <div className="" data-course-slug={slug ?? ''}>
      {/* hero section */}
      <div className="bg-[#081627] text-white relative overflow-hidden">
        {/* Decorative background clouds */}
        <div
          style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, #F84E8F 0%, transparent 70%)',
            borderRadius: '50%',
            top: '-200px',
            left: '0px',
            opacity: 0.2,
            filter: 'blur(50px)',
            backdropFilter: 'blur(164px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, #87C7FF 0%, transparent 70%)',
            borderRadius: '50%',
            top: '-200px',
            left: '122px',
            opacity: 0.2,
            filter: 'blur(50px)',
            backdropFilter: 'blur(164px)',
          }}
        />

        {/* return arrow */}
        <div className="px-6 z-20 relative mt-10">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="text-gray-400" />
          </button>
        </div>

        {/* course title */}
        <div className="px-6 z-20 mt-8 gap-4 flex flex-col">
          {(courseLanguage || courseMode) && (
            <div className="flex items-center gap-2 text-white/80">
              {courseLanguage && (
                <span className="rounded-full border border-white/20 px-3 py-1.5 text-sm leading-none font-medium ">
                  {courseLanguage}
                </span>
              )}
              {courseMode && (
                <span className="flex items-center justify-center gap-1 rounded-full border border-white/20  px-3 py-1.5 text-sm leading-none font-medium ">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M15.7356 4.5625C15.6559 4.51976 15.5661 4.49946 15.4757 4.50375C15.3853 4.50804 15.2978 4.53677 15.2225 4.58687L13 6.06563V4.5C13 4.23478 12.8946 3.98043 12.7071 3.79289C12.5196 3.60536 12.2652 3.5 12 3.5H2C1.73478 3.5 1.48043 3.60536 1.29289 3.79289C1.10536 3.98043 1 4.23478 1 4.5V11.5C1 11.7652 1.10536 12.0196 1.29289 12.2071C1.48043 12.3946 1.73478 12.5 2 12.5H12C12.2652 12.5 12.5196 12.3946 12.7071 12.2071C12.8946 12.0196 13 11.7652 13 11.5V9.9375L15.2225 11.4194C15.305 11.473 15.4016 11.501 15.5 11.5C15.6326 11.5 15.7598 11.4473 15.8536 11.3536C15.9473 11.2598 16 11.1326 16 11V5C15.9994 4.91004 15.9745 4.82191 15.9279 4.74491C15.8814 4.66791 15.815 4.60489 15.7356 4.5625ZM12 11.5H2V4.5H12V11.5ZM15 10.0656L13 8.7325V7.2675L15 5.9375V10.0656Z"
                      fill="white"
                    />
                  </svg>
                  {courseMode}
                </span>
              )}
            </div>
          )}
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h1>
        </div>

        {/* course description */}
        {description && (
          <div className="px-6 z-20 mt-4">
            <div
              className="text-white text-base leading-[1.5] line-clamp-3"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {/* Bottom Info Bar */}
        {/* Bottom Info Bar */}
        {heroStats.length > 0 && (
          <div className="mt-8 border border-white/15">
            <div className="flex flex-wrap divide-x divide-y divide-white/15">
              {heroStats.map(([label, val], i) => {
                const isLong = (label: string, val: string) =>
                  (label?.length || 0) + (val?.length || 0) > 30;
                const long = isLong(label, val);

                return (
                  <div
                    key={i}
                    className={`
              px-5 py-4
              flex flex-col justify-center
              min-w-[140px]
              
              ${long ? 'w-full flex-none' : 'flex-1'}
            `}
                  >
                    {/* Label */}
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                      {label}
                    </p>

                    {/* Value */}
                    <p className="text-[15px] font-medium leading-tight">
                      {val}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 w-full mt-2 p-4 py-8 bg-white/5">
          {/* variant options */}
          {hasOptions && (
            <VariantOptionSelector
              optionGroups={optionGroups}
              selectedOptions={selectedOptions}
              onSelect={handleOptionSelect}
              light
            />
          )}
          {/* price section */}
          <div className="flex gap-3 flex-row sm:items-center mt-4">
            {displayPrice && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl font-bold text-white">
                  {displayPrice}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isAdding || !activeVariantId}
              className="primary-btn flex w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium py-3 leading-[120%]"
            >
              {isAdding ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Adding…
                </span>
              ) : (
                'Enroll Now'
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className="my-6 bg-white text-black flex flex-col gap-6"
        ref={whatsIncludedRef}
      >
        <section className="space-y-6" id="features">
          <SectionTitle title="what's included" />
          <FeaturesSection specItems={specItems} />
        </section>
        <section className="space-y-6">
          <SectionTitle title="Course highlights" />
          <HighlightsSection specItems={specItems} />
        </section>
        <section className="space-y-6">
          <SectionTitle title="About" />
          {(() => {
            const aboutSpec = specItems.find(
              (s) => s.identifier === 'about_course',
            );
            if (!aboutSpec)
              return (
                <p className="text-slate-500 italic px-4">
                  No course description available
                </p>
              );
            if (aboutSpec.data && aboutSpec.data.length > 0) {
              return (
                <div className="space-y-6 px-4">
                  {aboutSpec.data.map((item, idx) => (
                    <div key={idx}>
                      <SpecBlock item={item} />
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div className="space-y-6 px-4">
                <SpecBlock item={aboutSpec} />
              </div>
            );
          })()}
        </section>
        <section className="space-y-6">
          <SectionTitle title="Demo Lectures" />
          {isCombo && (
            <IncludedProductTabs
              products={includedProducts}
              activeIndex={activeIncludedIdx}
              onChange={setActiveIncludedIdx}
            />
          )}
          {(() => {
            const sourceSpecs = isCombo ? activeIncludedSpecs : specItems;
            const demoSpec = sourceSpecs.find(
              (s) => s.identifier === 'demo_lectures',
            );
            return demoSpec ? (
              <div className="space-y-6">
                {demoSpec.videoItems && demoSpec.videoItems.length > 0 ? (
                  <VideoCarousel items={demoSpec.videoItems} />
                ) : (
                  demoSpec.data?.map((item, idx) => (
                    <div key={idx}>
                      <SpecBlock item={item} />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic px-4">
                No demo lectures available
              </p>
            );
          })()}
        </section>
        {/* Syllabus Section */}
        <section className="space-y-8">
          <SectionTitle title="Curriculum" />
          {isCombo && (
            <IncludedProductTabs
              products={includedProducts}
              activeIndex={activeIncludedIdx}
              onChange={setActiveIncludedIdx}
            />
          )}
          {(() => {
            const sourceSpecs = isCombo ? activeIncludedSpecs : specItems;
            const syllabusSpec = sourceSpecs.find(
              (s) => s.identifier === 'syllabus',
            );
            return syllabusSpec ? (
              <SyllabusSection item={syllabusSpec} />
            ) : (
              <p className="text-slate-500 italic px-4">
                No curriculum available
              </p>
            );
          })()}
        </section>
        {/* Faculties Section */}
        <section className="space-y-8">
          <SectionTitle title="Faculty Info" />
          {isCombo && (
            <IncludedProductTabs
              products={includedProducts}
              activeIndex={activeIncludedIdx}
              onChange={setActiveIncludedIdx}
            />
          )}
          {(() => {
            if (isCombo) {
              const facultySpec = activeIncludedSpecs.find(
                (s) =>
                  s.identifier === 'our_faculty' ||
                  s.identifier === 'faculty_info' ||
                  s.identifier === 'faculties',
              );
              const infos = facultySpec?.facultyInfos ?? [];
              if (infos.length > 0) {
                return (
                  <FacultiesCarousel
                    items={infos.map((f) => ({
                      name: f.name,
                      image: f.imageUrl ?? '',
                      description: f.description ?? '',
                    }))}
                  />
                );
              }
              return (
                <p className="text-slate-500 italic px-4">
                  No faculties available
                </p>
              );
            }
            return displayFaculties && displayFaculties.length > 0 ? (
              <FacultiesCarousel items={displayFaculties} />
            ) : (
              <p className="text-slate-500 italic px-4">
                No faculties available
              </p>
            );
          })()}
        </section>
        {/* FAQs Section */}
        <section className="space-y-8">
          <SectionTitle title="FAQs" />
          {(() => {
            const faqSpec = specItems.find((s) => s.identifier === 'faqs');
            return faqSpec?.faqItems && faqSpec.faqItems.length > 0 ? (
              <FaqSection items={faqSpec.faqItems} />
            ) : (
              <p className="text-slate-500 italic px-4">No FAQs available</p>
            );
          })()}
        </section>
      </div>

      {/* Sticky Price Section */}
      {isWhatsIncludedVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg animate-in slide-in-from-bottom-5 duration-300 z-40">
          <div className="max-w-full px-4 py-4">
            <div className="flex gap-3 flex-row sm:items-center">
              {displayPrice && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl font-bold text-lightgray">
                    {displayPrice}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleEnroll}
                disabled={isAdding || !activeVariantId}
                className="primary-btn flex w-full items-center justify-center gap-2 rounded-full text-base  font-medium py-2.5 leading-[120%]"
              >
                {isAdding ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Adding…
                  </span>
                ) : (
                  'Enroll Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
