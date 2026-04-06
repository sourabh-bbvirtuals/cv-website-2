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
  syllabus: 'Syllabus',
  faqs: 'FAQs',
};

const SUBNAV_SCROLL_SPY_OFFSET_PX = 128;

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
            className="flex gap-4 rounded-2xl border border-[rgba(8,22,39,0.1)] bg-white px-4 py-4 sm:px-6 shadow-sm"
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <p className="text-base sm:text-lg font-bold text-slate-800">
                {item.question}
              </p>
              <div
                className={`grid transition-[grid-template-rows] duration-200 ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
                    {item.answer}
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 self-start mt-0.5"
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <ChevronDown
                className={`size-5 transition-transform ${
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
          <ChevronLeft className="size-5 sm:size-8 text-slate-700" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex size-10 sm:size-12 items-center justify-center rounded-full  bg-slate-50  transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
        >
          <ChevronRight className="size-5 sm:size-8 text-slate-700" />
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
                  <div className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 shadow-xl">
                    <Play
                      className="ml-1.5 sm:ml-2 size-8 sm:size-10 text-white opacity-90"
                      fill="currentColor"
                    />
                  </div>
                </div>

                {/* Duration Badge */}
                {item.durationMinutes > 0 && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] sm:text-xs font-bold text-white backdrop-blur-md shadow-sm">
                    {item.durationMinutes}m
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-1.5 sm:gap-2 px-1">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  CHAPTER {i + 1}
                </p>
                <h3 className="line-clamp-2 text-base sm:text-lg lg:text-[19px] font-bold text-slate-900 leading-snug">
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
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
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
        className="flex items-center gap-3 group relative w-full"
      >
        <div className="flex size-8 shrink-0 items-center justify-center text-[#3a6bfc] group-hover:bg-[#3a6bfc]/10 rounded-full transition-colors">
          <CirclePlay className="size-[22px] stroke-[1.5]" />
        </div>
        <span className="text-sm sm:text-[15px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-left">
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
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Left Side: Stats Grid */}
        {includedEntries.length > 0 && (
          <div className="w-full lg:w-[45%] grid grid-cols-2 gap-y-4 sm:gap-y-4 gap-x-6 sm:gap-x-8 relative">
            {/* Vertical Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden sm:block" />

            {includedEntries.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <p className="text-[11px] sm:text-xs font-medium text-slate-400">
                  {label}
                </p>
                <p className="text-base sm:text-lg font-semibold text-white leading-tight">
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

  return (
    <div className="space-y-6 pt-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
        Syllabus
      </h3>
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
              <div className="hidden sm:flex shrink-0 pt-6">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#0f172a] text-[13px] font-bold text-white ring-[6px] ring-white">
                  {idx + 1}
                </span>
              </div>

              {/* The Interactive Card */}
              <div
                className={`flex-1 rounded-3xl bg-[#f8fafc] overflow-hidden transition-all ${
                  open ? 'shadow-[0_4px_24px_rgba(0,0,0,0.04)]' : ''
                } w-full`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5 text-left transition-colors"
                  onClick={() => setOpenAccordion(open ? null : idx)}
                >
                  <div className="flex flex-col gap-2.5 flex-1 relative">
                    {/* Lecture count */}
                    <span className="text-[12px] font-bold text-slate-500 bg-white border border-slate-200 rounded-full tracking-tight w-fit px-2.5 py-1 shadow-xs">
                      {lectureCount} Lectures
                    </span>

                    {/* Mobile Number Indicator */}
                    <div className="flex items-center gap-3 sm:hidden mb-1">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>

                    <span className="font-bold text-base sm:text-lg text-slate-800 leading-snug">
                      {child.name}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center justify-center size-8 sm:size-10 rounded-full transition-colors">
                    {open ? (
                      <ChevronDown className="size-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="size-5 text-slate-400" />
                    )}
                  </div>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-8 pb-6 pt-0">
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
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
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

  const specItems: SpecItem[] = (specifications?.product || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

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
  const courseLanguage = (
    courseInfoSpec?.table?.['Language'] || 'Hindi'
  ).trim();
  const isLive =
    (courseInfoSpec?.table?.['Mode'] || '').toLowerCase().includes('live') ||
    true;

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
  const price = product?.price || '';
  const facultyImage =
    product?.faculties?.[0]?.image ||
    product?.featuredAsset?.preview ||
    IMG_PRATIK;

  return (
    <div className="bg-white" data-course-slug={slug ?? ''}>
      {/* ── Hero section ── */}
      <div className="relative border-b border-slate-100 pb-12 pt-16 md:pt-20 lg:pt-24">
        {/* Abstract background pattern/image */}
        <div className="pointer-events-none absolute -top-32 left-0 h-100 w-full bg-[url('/assets/images/homepage/detail-page-header.png')] bg-contain bg-top opacity-60 4xl:min-h-125" />

        <div className="max-w-330 mx-auto px-4 lg:px-0 relative z-10">
          <div className="relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-[40px] border border-[#e2e8f0] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-8 lg:h-[571px] lg:p-9">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
              {/* Left - Hero Content */}
              <div className="flex-1 space-y-6 lg:space-y-10">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#081627CC]">
                      {courseLanguage}
                    </span>
                    {isLive && (
                      <span className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#081627CC]">
                        <div className="size-1.5 rounded-full bg-slate-400" />
                        Live
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                    {title}
                  </h1>
                  {description && (
                    <div
                      className="max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl lg:line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  )}
                </div>

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
                    className="w-full rounded-full bg-linear-to-r from-[#3a6bfc] to-[#2a58e6] px-12 py-4.5 text-[17px] font-bold text-white shadow-[0_12px_28px_-6px_rgba(58,107,252,0.45)] transition-all hover:shadow-[0_16px_36px_-6px_rgba(58,107,252,0.55)] active:scale-[0.98] sm:w-[320px] lg:w-[451px] disabled:opacity-60"
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
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[32px] bg-[#ede9fe] sm:aspect-video lg:h-[340px] lg:w-[420px] xl:w-[480px]">
                <img
                  src={facultyImage}
                  alt="Course faculty"
                  className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 object-cover object-top"
                />
                {product?.faculties?.[0]?.name && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <div className="rounded-full border border-white/20 bg-black/30 px-6 py-2.5 backdrop-blur-md">
                      <p className="whitespace-nowrap text-lg font-bold text-white">
                        {product.faculties[0].name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Info Bar */}
            {heroStats.length > 0 && (
              <div className="mt-10 rounded-2xl border border-[#DFD4EE] bg-[#f8fafc]/50 px-4 sm:px-6 py-5 lg:mt-0 lg:bg-white">
                <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-[#DFD4EE]">
                  {heroStats.map(([label, val], i) => (
                    <div
                      key={label}
                      className="w-1/2 sm:w-auto flex-1 px-3 sm:px-6 py-3 sm:py-0 flex flex-col justify-center"
                    >
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                        {label}
                      </p>

                      <p
                        className={`text-[18px] sm:text-[22px] lg:text-[24px] font-bold text-[#1e293b] leading-tight ${
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
      </div>

      {/* ── Sub-nav ── */}
      {navItems.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl hidden lg:block shadow-sm">
          <div className="custom-container flex gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`py-6 text-[20px] font-bold transition-all relative ${
                  activeNav === item.id
                    ? 'text-[#3a6bfc]'
                    : 'text-slate-400 hover:text-slate-600'
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
      <div className="w-full max-w-350 mx-auto px-4 py-16 lg:py-24 space-y-20 lg:space-y-32">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-8 xl:gap-12">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-20 lg:max-w-none">
            {specItems
              .filter(
                (spec) =>
                  spec.identifier?.toLowerCase() !== 'call_us' &&
                  spec.type !== 'contact_support',
              )
              .map((spec) => {
                if (spec.identifier === 'course_info') return null;

                if (spec.identifier === 'features') {
                  return (
                    <section
                      key={spec.identifier}
                      id={spec.identifier}
                      className="scroll-mt-32 space-y-8"
                    >
                      <SectionTitle title={spec.name} />
                      <FeaturesSection specItems={specItems} />
                    </section>
                  );
                }

                if (spec.identifier === 'syllabus') {
                  return (
                    <section
                      key={spec.identifier}
                      id={spec.identifier}
                      className="scroll-mt-32 space-y-8"
                    >
                      <SectionTitle title={spec.name} />
                      <SyllabusSection item={spec} />
                    </section>
                  );
                }

                if (spec.identifier === 'demo_lectures') {
                  return (
                    <section
                      key={spec.identifier}
                      id={spec.identifier}
                      className="relative scroll-mt-32 space-y-10"
                    >
                      <SectionTitle title={spec.name} />
                      {spec.videoItems && (
                        <VideoCarousel items={spec.videoItems} />
                      )}
                    </section>
                  );
                }

                // call_us is handled below the grid
                if (spec.identifier === 'faqs') {
                  return (
                    <section
                      key={spec.identifier}
                      id={spec.identifier}
                      className="scroll-mt-32 space-y-10"
                    >
                      <SectionTitle title={spec.name} />
                      {spec.faqItems && <FaqSection items={spec.faqItems} />}
                    </section>
                  );
                }

                return (
                  <section
                    key={spec.identifier}
                    id={spec.identifier}
                    className="scroll-mt-32 space-y-8"
                  >
                    <SectionTitle title={spec.name} />
                    <SpecBlock item={spec} depth={0} />
                  </section>
                );
              })}

            {specItems.length === 0 && description && (
              <section id="about" className="scroll-mt-32 space-y-8">
                <SectionTitle title="About Course" />
                <div
                  className="text-lg leading-relaxed text-slate-700"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </section>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-32 lg:w-[440px] hidden lg:block">
            <div className="flex flex-col rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-200/50">
              {/* Image Section */}
              <div className="relative overflow-hidden rounded-2xl bg-[#eee8f6] shadow-inner mb-6 h-[246px]">
                <img
                  src={facultyImage}
                  alt="Course preview"
                  className="w-full h-full object-cover opacity-95 transition-transform hover:scale-105"
                />
              </div>

              {/* Content Section */}
              <div className="space-y-5 ">
                {/* Tags */}
                <div className="flex gap-2">
                  <span className="rounded-full bg-transparent px-4 py-1.5 text-sm font-bold text-[#334155] border border-slate-200">
                    Hindi
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-transparent px-4 py-1.5 text-sm font-bold text-[#334155] border border-slate-200">
                    <div className="size-2 rounded-full border-[1.5px] border-[#334155]/60 bg-slate-200" />
                    Live
                  </span>
                </div>

                {/* Title & Price */}
                <div className="space-y-8">
                  <h3 className="text-[24px] text-slate-900 leading-[1.2] font-medium tracking-[-0.02em]">
                    {title}
                  </h3>

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
                className="w-full rounded-full bg-linear-to-b from-[#3a6bfc] to-[#2a58e6] py-4 text-[17px] font-semibold text-white transition-all active:scale-[0.97] shadow-[0_12px_28px_-6px_rgba(58,107,252,0.45)] hover:shadow-[0_16px_36px_-6px_rgba(58,107,252,0.55)] border-t border-white/20 mt-8 disabled:opacity-60"
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
