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
} from 'lucide-react';
import parse from 'html-react-parser';
import { useFetcher, useNavigate } from '@remix-run/react';

// ─── Static assets (Figma) ────────────────────────────────────────────────────
const IMG_PRATIK =
  'https://www.figma.com/api/mcp/asset/b5f8d002-8c8c-46bf-989e-9ae3a805bc23';
const IMG_FEAT_CHECK =
  'https://www.figma.com/api/mcp/asset/24e0cca8-12bc-4e01-95cc-e660459a7be0';

// ─── Types ────────────────────────────────────────────────────────────────────
type SpecItem = {
  order: number;
  identifier: string;
  name: string;
  type: string;
  table?: Record<string, string>;
  text?: string;
  data?: SpecItem[];
  list?: string[];
  faqItems?: Array<{ question: string; answer: string }>;
  videoItems?: Array<{ url: string; title: string; durationMinutes: number }>;
  contactSupportDetail?: {
    title: string;
    description: string;
    buttonText: string;
    url: string;
  };
  statItems?: Array<{ label: string; value: string }>;
};

type ProductData = {
  id: string;
  title: string;
  description: string;
  price: string;
  priceWithTax: number;
  featuredAsset?: { preview: string } | null;
  faculties?: Array<{ name: string; image: string; description: string }>;
  customFields?: {
    customData?: string | null;
  };
  variantId?: string | null;
} | null;

type CourseDetailPageProps = {
  slug?: string;
  product?: ProductData;
  specifications?: { product?: SpecItem[] } | null;
};

// ─── Nav IDs derived from spec identifiers we want to show in subnav ─────────
const NAV_MAP: Record<string, string> = {
  features: 'Features',
  about_course: 'About',
  demo_lectures: 'Demo Lectures',
  syllabus: 'Curriculum',
  faculties: 'Faculties',
  faqs: 'FAQs',
};

const SUBNAV_SCROLL_SPY_OFFSET_PX = 128;

// ─── Custom Dropdown Component ────────────────────────────────────────────────
type CustomDropdownProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

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
      <label className="block text-xs font-semibold uppercase tracking-widest text-lightgray/50 mb-3">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-full border text-[#081627] border-slate-200 bg-white text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#3a6bfc] focus:border-transparent transition-all hover:border-slate-300 flex items-center justify-between"
      >
        <span className={selectedOption ? '' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`size-5 text-slate-400 transition-transform duration-200 ${
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

// ─── Spec Renderers ───────────────────────────────────────────────────────────
function SpecTable({ table }: { table: Record<string, string> }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[rgba(8,22,39,0.1)]">
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
        <div key={i} className="flex items-center gap-3 py-0 w-full">
          <div className="flex size-8 shrink-0 items-center justify-center text-[#3a6bfc] rounded-full">
            <CirclePlay className="size-[22px] stroke-[1.5]" />
          </div>
          <span className="text-sm sm:text-[15px] font-medium text-slate-600 text-left">
            {item}
          </span>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-center"
        >
          <p className="text-2xl sm:text-3xl font-black text-[#3a6bfc]">
            {stat.value}
          </p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
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
            className="flex gap-4 rounded-2xl border border-[rgba(8,22,39,0.1)] bg-white px-4 py-4 sm:px-6"
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <p className="text-base sm:text-lg font-medium text-slate-800">
                {item.question}
              </p>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-lightgray/50">
                    {item.answer}
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-lightgray/50 self-start mt-0.5"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <ChevronDown
                className={`size-4 transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function VideoCarousel({
  items,
}: {
  items: Array<{ url: string; title: string; durationMinutes: number }>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="relative group">
      {/* Navigation Arrows positioned to align with the section title above */}
      <div className="absolute -top-[76px] right-0 hidden items-center gap-3 sm:flex">
        <button
          onClick={() => scroll('left')}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full  bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          <ChevronLeft className="size-5 text-slate-500" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full  bg-slate-50  transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          <ChevronRight className="size-5 text-slate-500" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
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
              className="group flex flex-col gap-4 sm:gap-5 shrink-0 snap-start w-[260px] sm:w-[320px] lg:w-[360px] transition-transform hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-900 shadow-md">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Play className="size-10 text-white/50" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute left-1/2 top-1/2 flex size-[40px] sm:size-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-400 bg-gray-500">
                    <Play fill="#FFFFFF" className="text-white w-4 sm:w-5" />
                  </div>
                </div>

                {/* Duration Badge */}
                {item.durationMinutes > 0 && (
                  <div className="pointer-events-none absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 rounded-full border border-white/15 bg-white/15 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-medium leading-[150%] text-white backdrop-blur-[17px] sm:text-base sm:leading-[150%]">
                    {item.durationMinutes}m
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-1.5 sm:gap-2 px-1">
                <p className="text-xs sm:text-sm font-medium text-lightgray/50">
                  CHAPTER {i + 1}
                </p>
                <h3 className="line-clamp-2 text-base sm:text-lg lg:text-[20px] font-medium text-slate-900 leading-snug">
                  {item.title}
                </h3>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function FacultiesCarousel({
  items,
}: {
  items: Array<{ name: string; image: string; description: string }>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group">
      {/* Navigation Arrows positioned to align with the section title above */}
      <div className="absolute -top-[76px] right-0 hidden items-center gap-3 sm:flex">
        <button
          onClick={() => scroll('left')}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          <ChevronLeft className="size-5 text-slate-500" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          <ChevronRight className="size-5 text-slate-500" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-row gap-6 sm:gap-8 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((faculty, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <div
              key={i}
              className="flex flex-col shrink-0 snap-start w-full gap-4"
            >
              {/* Header: Avatar + Name/Subtitle */}
              <div className="flex gap-4 items-center">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-slate-100 shadow-md flex-shrink-0">
                  <img
                    src={faculty.image}
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start gap-2 flex-1">
                  {/* Faculty Info */}
                  <h3 className="text-base font-semibold text-slate-900">
                    {faculty.name}
                  </h3>
                  <p className="text-base text-lightgray/50">{'CA, M.com'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 w-full text-base text-lightgray/50 leading-relaxed flex-1">
                {isExpanded ? (
                  <>
                    <p>{faculty.description}</p>
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
                    <p className="line-clamp-3">{faculty.description}</p>
                    <button
                      onClick={() => setExpandedIdx(i)}
                      className="font-medium text-[#3a6bfc] hover:underline flex items-center gap-1 w-fit"
                    >
                      Show More
                      <ChevronDown className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
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
    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
      {title}
    </h2>
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
    <div className="rounded-[24px] bg-[#0f172a] p-4 sm:p-5 lg:p-6 text-white shadow-xl overflow-hidden relative w-full border border-slate-800/50">
      <div className="relative z-10 flex flex-col lg:flex-row gap-3 lg:gap-10">
        {/* Left Side: Stats Grid */}
        {includedEntries.length > 0 && (
          <div className="w-full lg:w-[45%] grid grid-cols-2 gap-x-6 sm:gap-x-8 relative">
            {/* Vertical Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden sm:block" />

            {includedEntries.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 group relative">
                  <p className="text-[11px] sm:text-sm font-normal text-slate-400 truncate">
                    {label}
                  </p>
                  <div className="relative">
                    <Info className="size-3 sm:size-3.5 text-slate-500 shrink-0 cursor-help opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 whitespace-nowrap">
                      <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                        {label}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>
                <p className="text-base sm:text-lg font-medium text-white leading-tight">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Divider between left & right */}
        {includedEntries.length > 0 && highlights.length > 0 && (
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        )}

        {/* Right Side: Highlights */}
        {highlights.length > 0 && (
          <div className="flex-1 flex flex-col gap-3 sm:gap-3">
            <ul className="flex flex-col gap-3 sm:gap-3">
              {highlights.map((line, i) => {
                const t = line.toLowerCase();
                let Icon = CheckCircle2;

                if (t.includes('master teacher') || t.includes('live classes'))
                  Icon = User;
                else if (t.includes('quiz')) Icon = CircleHelp;
                else if (t.includes('doubt')) Icon = MessageSquare;
                else if (t.includes('recording')) Icon = CirclePlay;
                else if (t.includes('assignment')) Icon = ClipboardList;
                else if (t.includes('handwritten')) Icon = Pencil;

                return (
                  <li key={i} className="flex items-start gap-3 sm:gap-4">
                    <Icon
                      className="mt-1 size-4 sm:size-5 shrink-0 text-slate-400"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm sm:text-base text-slate-200 leading-relaxed">
                      {line}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 right-0 -m-32 size-64 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 -m-32 size-64 rounded-full bg-purple-500/10 blur-[100px]" />
    </div>
  );
}

function RenderSyllabus({ item }: { item: SpecItem }) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const data = item.data || [];

  if (data.length === 0)
    return <p className="text-slate-500 italic">No syllabus data available</p>;
  console.log('Rendering syllabus with data:', data);
  return (
    <div className="space-y-6">
      <div
        className={`flex max-w-max text-[#3A6BFC] font-medium items-center gap-2 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm leading-[150%] lg:text-base lg:leading-[150%] border-[#3A6BFC]/20 bg-[#3A6BFC1A]/30`}
      >
        Subject
      </div>
      <div className="flex flex-col gap-5 sm:gap-6 relative">
        {/* Subtle vertical connector line connecting numbers */}
        <div className="absolute left-[13px] top-[40px] bottom-[40px] w-px bg-slate-200 hidden sm:block" />

        {data.map((child, idx) => {
          const open = openAccordion === idx;
          // Count only valid video items or sub-blocks for the lecture count.
          const lectureCount =
            child.data?.length ||
            child.list?.length ||
            child.videoItems?.length ||
            0;

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full items-start relative z-10"
            >
              {/* Outer Number Circle (Desktop) */}
              <div className="hidden sm:flex shrink-0 pt-2">
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
                className={`flex-1 rounded-2xl p-4 gap-4 bg-[#F5F6F9B2] overflow-hidden transition-all ${
                  open ? 'shadow-[0_4px_24px_rgba(0,0,0,0.04)]' : ''
                } w-full`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 text-left transition-colors"
                  onClick={() => setOpenAccordion(open ? null : idx)}
                >
                  <div className="flex flex-col gap-2 flex-1 relative">
                    <div className="flex items-center justify-between">
                      {/* Lecture count */}
                      <span className="text-[12px] font-medium text-lightgray/50 bg-white border border-slate-200 rounded-full tracking-tight w-fit px-2.5 py-0.5 shadow-xs">
                        {lectureCount} Lectures
                      </span>
                      <div className="shrink-0 flex items-center justify-center  bg-[#08162708]/10 rounded-full transition-colors">
                        {open ? (
                          <ChevronDown className="size-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="size-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Mobile Number Indicator */}
                    <div className="flex items-center gap-3 sm:hidden mb-1">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>

                    <span className="font-medium text-base sm:text-lg text-lightgray leading-snug">
                      {child.name}
                    </span>
                  </div>
                </button>

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
    <div className="space-y-6">
      {subjects.length > 1 && (
        <div className="flex flex-wrap gap-3 sm:gap-4 w-fit">
          {subjects.map((subj, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-5 py-2 sm:px-7 sm:py-2.5 text-sm sm:text-[15px] font-bold transition-all border ${
                activeTab === i
                  ? 'border-[#3a6bfc]/30 bg-blue-50/50 text-[#3a6bfc] shadow-[0_2px_8px_rgba(58,107,252,0.08)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-[#081627] hover:bg-slate-50'
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseDetailPage({
  slug,
  product,
  specifications,
}: CourseDetailPageProps) {
  const navigate = useNavigate();
  const addToCartFetcher = useFetcher();
  const isAdding = addToCartFetcher.state !== 'idle';

  const handleEnroll = useCallback(() => {
    const variantId = product?.variantId;
    if (!variantId) return;
    addToCartFetcher.submit(
      { variantId, quantity: '1' },
      { method: 'post', action: '/api/enroll' },
    );
  }, [product?.variantId, addToCartFetcher]);

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

  // Add mock data if empty for visualization
  if (specItems.length === 0) {
    specItems = [
      {
        order: 1,
        identifier: 'features',
        name: 'Features',
        type: 'composite',
        data: [
          {
            order: 0,
            identifier: 'features-table',
            name: 'Features Table',
            type: 'table',
            table: {
              Language: 'English',
              'No. of Lectures': '80-85',
              Quizzes: '120+',
              'Formula Cards': '100+',
              'Mock Tests': '80+',
              Notes: '32+',
            },
          },
          {
            order: 1,
            identifier: 'features-list',
            name: 'Course Highlights',
            type: 'list',
            list: [
              'Live Classes by Master Teachers',
              'Live in-class quizzes and leaderboard',
              'Live in-class doubt solving',
              'Recordings of previous classes',
              'Assignments and class notes',
              'Handwritten Teacher Notes after class',
            ],
          },
        ],
      },
      {
        order: 2,
        identifier: 'about_course',
        name: 'About',
        type: 'composite',
        data: [
          {
            order: 0,
            identifier: 'about-desc',
            name: 'Course Description',
            type: 'html_text',
            text: '<p>This comprehensive course is designed to help you master the fundamentals and advanced concepts. Our expert instructors bring years of industry experience to deliver high-quality content with practical applications.</p>',
          },
          {
            order: 1,
            identifier: 'about-benefits',
            name: "What You'll Learn",
            type: 'list',
            list: [
              'Master core concepts and theories',
              'Practical implementation techniques',
              'Real-world problem-solving strategies',
              'Industry best practices',
              'Hands-on project experience',
              'Certification upon completion',
            ],
          },
        ],
      },
      {
        order: 3,
        identifier: 'demo_lectures',
        name: 'Demo Lectures',
        type: 'video_carousel',
        videoItems: [
          {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Introduction to Basics',
            durationMinutes: 12,
          },
          {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Fundamentals Deep Dive',
            durationMinutes: 18,
          },
          {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Advanced Concepts',
            durationMinutes: 15,
          },
        ],
      },
      {
        order: 4,
        identifier: 'syllabus',
        name: 'Syllabus',
        type: 'composite',
        data: [
          {
            order: 0,
            identifier: 'syllabus-main',
            name: 'Full Course',
            type: 'composite',
            data: [
              {
                order: 0,
                identifier: 'module-1',
                name: 'Module 1: Foundations',
                type: 'composite',
                data: [
                  {
                    order: 0,
                    identifier: 'module-1-topics',
                    name: 'Topics',
                    type: 'list',
                    list: [
                      'Introduction and Overview',
                      'Core Concepts',
                      'Basic Principles',
                      'Setup and Configuration',
                    ],
                  },
                ],
              },
              {
                order: 1,
                identifier: 'module-2',
                name: 'Module 2: Intermediate Topics',
                type: 'composite',
                data: [
                  {
                    order: 0,
                    identifier: 'module-2-topics',
                    name: 'Topics',
                    type: 'list',
                    list: [
                      'Advanced Techniques',
                      'Best Practices',
                      'Real-world Applications',
                      'Troubleshooting Guide',
                    ],
                  },
                ],
              },
              {
                order: 2,
                identifier: 'module-3',
                name: 'Module 3: Advanced Concepts',
                type: 'composite',
                data: [
                  {
                    order: 0,
                    identifier: 'module-3-topics',
                    name: 'Topics',
                    type: 'list',
                    list: [
                      'Complex Scenarios',
                      'Optimization Techniques',
                      'Industry Patterns',
                      'Projects and Case Studies',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        order: 5,
        identifier: 'faqs',
        name: 'FAQs',
        type: 'faq',
        faqItems: [
          {
            question: 'Who is this course suitable for?',
            answer:
              'This course is designed for beginners and intermediate learners who want to master the subject. No prior experience is required.',
          },
          {
            question: 'What is the course duration?',
            answer:
              'The course typically takes 6-8 weeks to complete, depending on your pace. You can access all materials anytime.',
          },
          {
            question: 'Is there a certificate upon completion?',
            answer:
              'Yes, you will receive a completion certificate that can be shared on professional networks.',
          },
          {
            question: 'What if I have doubts during the course?',
            answer:
              'Our instructors are available to answer questions through live sessions and discussion forums.',
          },
          {
            question: 'Can I access the course materials after completion?',
            answer:
              'Yes, you have lifetime access to all course materials and any future updates.',
          },
        ],
      },
    ];
  }

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

  // Add mock data if empty for visualization
  if (heroStats.length === 0) {
    heroStats.push(
      ['Standard', 'CBSE/ICSE'],
      ['Board Year', '2024-25'],
      ['START-END DATE', 'Jan 2024 - Mar 2024'],
    );
  }
  const courseLanguage = (
    courseInfoSpec?.table?.['Language'] || 'Hindi'
  ).trim();
  const isLive =
    (courseInfoSpec?.table?.['Mode'] || '').toLowerCase().includes('live') ||
    true;

  const navItems = specItems
    .filter((s) => NAV_MAP[s.identifier])
    .map((s) => ({ id: s.identifier, label: NAV_MAP[s.identifier] || s.name }));

  // Add mock data if empty for visualization
  if (navItems.length === 0) {
    navItems.push(
      { id: 'features', label: 'Features' },
      { id: 'about_course', label: 'About' },
      { id: 'demo_lectures', label: 'Demo Lectures' },
      { id: 'syllabus', label: 'Syllabus' },
      { id: 'faqs', label: 'FAQs' },
    );
  }

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
  const price = product?.price || '';
  const facultyImage =
    product?.faculties?.[0]?.image ||
    product?.featuredAsset?.preview ||
    IMG_PRATIK;

  const [courseType, setCourseType] = useState<string>('');
  const [mode, setMode] = useState<string>('');

  // Add mock faculties data if empty for visualization
  const displayFaculties =
    product?.faculties && product.faculties.length > 0
      ? product.faculties
      : [
          {
            name: 'CA Bhushal Gosar',
            image:
              'https://www.figma.com/api/mcp/asset/b5f8d002-8c8c-46bf-989e-9ae3a805bc23',
            description:
              "Grow with Google is an initiative that draws on Google's decades-long history of building products, platforms, and services that help people and businesses grow. We aim to help everyone – those who make up the workforce of today and the students who will drive the...",
          },
          {
            name: 'CA Bhushal Gosar',
            image:
              'https://www.figma.com/api/mcp/asset/b5f8d002-8c8c-46bf-989e-9ae3a805bc23',
            description:
              "Grow with Google is an initiative that draws on Google's decades-long history of building products, platforms, and services that help people and businesses grow. We aim to help everyone – those who make up the workforce of today and the students who will drive the...",
          },
        ];

  return (
    <div className="bg-white" data-course-slug={slug ?? ''}>
      {/* ── Hero section ── */}
      <div className="relative border-b border-slate-200 pb-12 pt-16 md:pt-20 lg:pt-24">
        {/* Abstract background pattern/image */}
        <div className="pointer-events-none absolute -top-32 left-0 h-[530px] w-full bg-[url('/assets/images/homepage/detail-page-header.png')] bg-cover" />

        {/* big card */}
        <div className="max-w-330 border gap-[50px] rounded-4xl border-[#DFD4EE] bg-white mx-auto p-9 relative z-10">
          {/* top part */}
          <div className="flex flex-row items-center gap-9">
            {/* Left - Hero Content */}
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-lightgray/70">
                    <span className="rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1.5 text-base leading-none font-medium text-lightgray">
                      {courseLanguage}
                    </span>
                    {isLive && (
                      <span className="flex items-center justify-center gap-1 rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1.5 text-base leading-none font-medium text-lightgray">
                        <span className="inline-block text-lightgray/80 size-[7px] rounded-full border bg-lightgray/20" />
                        {'Live'}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl lg:leading-[1.15]">
                    {title}
                  </h1>
                </div>

                {/* {description && (
                  <div
                    className="max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl lg:line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )} */}
              </div>

              {/* selection */}
              <div className="flex gap-6 w-full mt-10">
                <CustomDropdown
                  label="Select Course Type"
                  value={courseType}
                  onChange={setCourseType}
                  options={[
                    { value: 'recorded', label: 'Recorded' },
                    { value: 'live', label: 'Live' },
                  ]}
                />

                <CustomDropdown
                  label="Mode"
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'google-drive', label: 'Google Drive' },
                    { value: 'zoom', label: 'Zoom' },
                    { value: 'recorded', label: 'Recorded' },
                  ]}
                />
              </div>

              {/* price */}

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {price && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#0f172a] sm:text-4xl">
                      {price}
                    </span>
                    <span className="text-lg font-medium text-slate-300 line-through sm:text-xl">
                      ₹
                      {(product?.priceWithTax
                        ? (product.priceWithTax * 1.5) / 100
                        : 0
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isAdding || !product?.variantId}
                  className="primary-btn flex w-[449px] items-center justify-center gap-2 rounded-full text-xl font-medium py-4 leading-[120%]"
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

            {/* Right - Faculty Image Box */}
            <div className="flex w-[510px] justify-end">
              {/* Image Container with Original Primary Logic */}
              <div className="relative  h-[340px] w-full max-w-[510px] rounded-2xl bg-[#faeae5] overflow-hidden mb-0">
                <img
                  src={facultyImage}
                  alt={product?.faculties?.[0]?.name || 'Faculty'}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-gray-500 px-4 py-2">
                  <span className="text-base md:text-xl font-medium text-white leading-[1.2]">
                    {product?.faculties?.[0]?.name || 'Faculty Name'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          {heroStats.length > 0 && (
            <div className="mt-14 rounded-2xl border border-[#DFD4EE] bg-[#f8fafc]/50 px-2 py-6 lg:bg-white">
              <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-[#0816271A]/80">
                {heroStats.map(([label, val], i) => (
                  <div
                    key={label}
                    className="w-1/2 sm:w-auto flex-1 px-3 gap-4 sm:px-6 py-3 sm:py-0 flex flex-col justify-center"
                  >
                    <p className="text-sm font-semibold uppercase tracking-widest text-lightgray/50">
                      {label}
                    </p>

                    <p
                      className={`text-[18px] sm:text-[22px] lg:text-[24px] font-semibold text-[#1e293b] leading-tight ${
                        i === heroStats.length - 1 ? 'whitespace-nowrap' : ''
                      }`}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-nav ── */}
      {navItems.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl hidden lg:block">
          <div className="custom-container flex gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`py-6 text-[20px] font-semibold transition-all relative ${
                  activeNav === item.id
                    ? 'text-[#3a6bfc]'
                    : 'text-lightgray/50 hover:text-[#081627]'
                }`}
              >
                {item.label}
                {activeNav === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#3a6bfc]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main body ── */}
      <div className="w-full max-w-350 mx-auto px-4 py-12 space-y-20 lg:space-y-32">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-8">
          {/* Main Content - Left Column */}
          <div className="min-w-0 flex-1 space-y-20 lg:max-w-none">
            {/* Features Section */}
            <section id="features" className="scroll-mt-32 space-y-8">
              <SectionTitle title="Features" />
              <FeaturesSection specItems={specItems} />
            </section>

            {/* About Course Section */}
            <section id="about_course" className="scroll-mt-32 space-y-8">
              <SectionTitle title="About" />
              {(() => {
                const aboutSpec = specItems.find(
                  (s) => s.identifier === 'about_course',
                );
                return aboutSpec ? (
                  <div className="space-y-6">
                    {aboutSpec.data?.map((item, idx) => (
                      <div key={idx}>
                        <SpecBlock item={item} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    No course description available
                  </p>
                );
              })()}
            </section>

            {/* Demo Lectures Section */}
            <section id="demo_lectures" className="scroll-mt-32 space-y-8">
              <SectionTitle title="Demo Lectures" />
              {(() => {
                const demoSpec = specItems.find(
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
                  <p className="text-slate-500 italic">
                    No demo lectures available
                  </p>
                );
              })()}
            </section>

            {/* Syllabus Section */}
            <section id="syllabus" className="scroll-mt-32 space-y-8">
              <SectionTitle title="Curriculum" />
              {(() => {
                const syllabusSpec = specItems.find(
                  (s) => s.identifier === 'syllabus',
                );
                return syllabusSpec ? (
                  <SyllabusSection item={syllabusSpec} />
                ) : (
                  <p className="text-slate-500 italic">
                    No curriculum available
                  </p>
                );
              })()}
            </section>

            {/* Faculties Section */}
            <section id="faculties" className="scroll-mt-32 space-y-8">
              <SectionTitle title="Faculties" />
              {displayFaculties && displayFaculties.length > 0 ? (
                <FacultiesCarousel items={displayFaculties} />
              ) : (
                <p className="text-slate-500 italic">No faculties available</p>
              )}
            </section>

            {/* FAQs Section */}
            <section id="faqs" className="scroll-mt-32 space-y-8">
              <SectionTitle title="FAQs" />
              {(() => {
                const faqSpec = specItems.find((s) => s.identifier === 'faqs');
                return faqSpec?.faqItems && faqSpec.faqItems.length > 0 ? (
                  <FaqSection items={faqSpec.faqItems} />
                ) : (
                  <p className="text-slate-500 italic">No FAQs available</p>
                );
              })()}
            </section>
          </div>

          {/* Sticky Sidebar - Right Column */}
          <aside className="w-full shrink-0 lg:sticky lg:top-32 lg:w-[440px] hidden  lg:block">
            <div className="flex flex-col rounded-[24px] border border-slate-300 bg-white p-6 shadow-2xl shadow-slate-200/50">
              {/* Image Section */}
              <div className="relative overflow-hidden rounded-2xl bg-[#eee8f6] shadow-inner mb-6 h-[246px]">
                <img
                  src={facultyImage}
                  alt="Course preview"
                  className="w-full h-full object-cover opacity-95 transition-transform hover:scale-105"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-gray-500 px-4 py-2">
                  <span className="text-base md:text-lg font-medium text-white leading-[1.2]">
                    {product?.faculties?.[0]?.name || 'Faculty Name'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-5 ">
                {/* Tags */}
                <div className="flex items-center gap-2 text-lightgray/70">
                  <span className="rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1.5 text-sm leading-none font-medium text-lightgray">
                    {courseLanguage}
                  </span>
                  {isLive && (
                    <span className="flex items-center justify-center gap-1 rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-1.5 text-sm leading-none font-medium text-lightgray">
                      <span className="inline-block text-lightgray/80 size-[7px] rounded-full border bg-lightgray/20" />
                      {'Live'}
                    </span>
                  )}
                </div>

                {/* Title & Price */}
                <div className="space-y-8">
                  <h3 className="text-[24px] text-slate-900 leading-[1.2] font-medium tracking-[-0.02em]">
                    {title}
                  </h3>

                  <div className="flex flex-col gap-6 w-full">
                    <CustomDropdown
                      label="Select Course Type"
                      value={courseType}
                      onChange={setCourseType}
                      options={[
                        { value: 'recorded', label: 'Recorded' },
                        { value: 'live', label: 'Live' },
                      ]}
                    />

                    <CustomDropdown
                      label="Mode"
                      value={mode}
                      onChange={setMode}
                      options={[
                        { value: 'google-drive', label: 'Google Drive' },
                        { value: 'zoom', label: 'Zoom' },
                        { value: 'recorded', label: 'Recorded' },
                      ]}
                    />
                  </div>

                  {price && (
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-slate-900 leading-none">
                        {price}
                      </p>
                      <p className="text-2xl font-medium text-slate-400 line-through opacity-60">
                        ₹
                        {(product?.priceWithTax
                          ? (product.priceWithTax * 1.5) / 100
                          : 0
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Section */}
              <button
                type="button"
                onClick={handleEnroll}
                disabled={isAdding || !product?.variantId}
                className="primary-btn flex w-full mt-8 items-center justify-center gap-2 rounded-full text-xl font-medium py-4 leading-[120%]"
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
          </aside>
        </div>
      </div>
    </div>
  );
}
