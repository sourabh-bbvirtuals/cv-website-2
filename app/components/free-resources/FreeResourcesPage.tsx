import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate, useRouteLoaderData, useSearchParams } from '@remix-run/react';
import { ChevronDown, Play, ServerOff, X } from 'lucide-react';
import { PillSelect } from '../ui/PillSelect';
import { ContentCardItem } from './ContentCard';
import { LimitReachedOverlay } from './LimitReachedOverlay';
import type { TabContentResponse } from '~/utils/bbServer';
import {
  MockTestsIcon,
  FreeVideosIcon,
  PastPapersIcon,
  QuizzesIcon,
  StudyNotesIcon,
} from '../new-homepage/Icons';
import { useBoardSelection } from '~/context/BoardSelectionContext';

// ── Tab config ─────────────────────────────────────────────────

const TAB_SEGMENT_BY_NAME: Record<string, string> = {
  'Mock Tests': 'mock-tests',
  'Study Notes': 'study-notes',
  'Past Papers': 'past-papers',
  Quizzes: 'quizzes',
  'Free Videos': 'free-videos',
};

const TAB_META: Record<
  string,
  { borderActive: string; iconWrap: string; icon: React.ReactNode }
> = {
  'Mock Tests': {
    borderActive: 'border-[#f5a0ad]',
    iconWrap: 'bg-[#ffeef8]',
    icon: <MockTestsIcon />,
  },
  'Study Notes': {
    borderActive: 'border-[#B9C9FF]',
    iconWrap: 'bg-[#eef2ff]',
    icon: <StudyNotesIcon classname="max-w-6" />,
  },
  'Past Papers': {
    borderActive: 'border-[#7ec8ee]',
    iconWrap: 'bg-[#edf9ff]',
    icon: <PastPapersIcon />,
  },
  Quizzes: {
    borderActive: 'border-[#f0a090]',
    iconWrap: 'bg-[#fff1ee]',
    icon: <QuizzesIcon />,
  },
  'Free Videos': {
    borderActive: 'border-[#8aadd4]',
    iconWrap: 'bg-[#eef0ff]',
    icon: <FreeVideosIcon />,
  },
};

type SeoEntry = { heading: string; subtext: string };
type BoardSeoMap = Record<string, SeoEntry>;

const TAB_SEO_CONTENT: Record<string, { default: SeoEntry; byBoard: BoardSeoMap }> = {
  'Mock Tests': {
    default: {
      heading: 'Full-Length Mock Tests — Board-Pattern, Subject-Wise',
      subtext:
        'Practice the way you\u2019ll be examined. Our mock tests mirror the exact CBSE and Maharashtra HSC paper patterns — structured full-length tests with proper marking schemes.',
    },
    byBoard: {
      cbse: {
        heading: 'Full-Length CBSE Mock Tests — Board-Pattern, Subject-Wise',
        subtext:
          'Practice the way you\u2019ll be examined. Our mock tests mirror the exact CBSE paper pattern — structured full-length tests with proper marking schemes.',
      },
      mh: {
        heading: 'Full-Length Maharashtra HSC Mock Tests — Board-Pattern, Subject-Wise',
        subtext:
          'Practice the way you\u2019ll be examined. Our mock tests mirror the exact Maharashtra HSC paper pattern — structured full-length tests with proper marking schemes.',
      },
      cuet: {
        heading: 'Full-Length CUET-UG Mock Tests — Domain & General Test',
        subtext:
          'Practice the way you\u2019ll be examined. Full-length CUET mock tests covering Accountancy, BST, Economics, English and General Test — with proper marking schemes.',
      },
    },
  },
  Quizzes: {
    default: {
      heading: 'Topic-Wise MCQ Quizzes — CBSE, HSC & CUET Ready',
      subtext:
        'Nail the concepts before the exam does. Bite-sized MCQ quizzes across every chapter — with instant feedback and explanations.',
    },
    byBoard: {
      cbse: {
        heading: 'Topic-Wise MCQ Quizzes — CBSE Commerce',
        subtext:
          'Bite-sized MCQ quizzes aligned to the CBSE syllabus — from Partnership Accounts to Consumer Protection — with instant feedback and explanations.',
      },
      mh: {
        heading: 'Topic-Wise MCQ Quizzes — Maharashtra HSC Commerce',
        subtext:
          'Bite-sized MCQ quizzes aligned to the Maharashtra HSC syllabus — BK, OCM, Economics and SP — with instant feedback and explanations.',
      },
      cuet: {
        heading: 'Topic-Wise MCQ Quizzes — CUET-UG Commerce',
        subtext:
          'Bite-sized MCQ quizzes for CUET domain subjects — Accountancy, BST, Economics, Entrepreneurship — with instant feedback and explanations.',
      },
    },
  },
  'Past Papers': {
    default: {
      heading: 'Previous Year Question Papers — CBSE & Maharashtra Board',
      subtext:
        'Explore past papers from CBSE and Maharashtra HSC board exams — with answer keys — so you know exactly what the examiner is looking for.',
    },
    byBoard: {
      cbse: {
        heading: 'Previous Year Question Papers — CBSE Commerce',
        subtext:
          'Explore CBSE past papers with answer keys — so you know exactly what the examiner is looking for.',
      },
      mh: {
        heading: 'Previous Year Question Papers — Maharashtra HSC Commerce',
        subtext:
          'Explore Maharashtra HSC past papers with answer keys — so you know exactly what the examiner is looking for.',
      },
      cuet: {
        heading: 'Previous Year Question Papers — CUET-UG',
        subtext:
          'Explore CUET-UG past papers with answer keys — so you know exactly what the examiner is looking for.',
      },
    },
  },
  'Free Videos': {
    default: {
      heading: 'Free Concept Videos — Commerce-Only, Clutter-Free',
      subtext:
        'No science detours. No engineering tangents. Every video is made for commerce students, by commerce-focused educators.',
    },
    byBoard: {
      cbse: {
        heading: 'Free CBSE Commerce Concept Videos',
        subtext:
          'Every video is aligned to the CBSE commerce syllabus — start with the chapters that confuse you most.',
      },
      mh: {
        heading: 'Free Maharashtra HSC Commerce Concept Videos',
        subtext:
          'Every video is aligned to the Maharashtra HSC commerce syllabus — start with the chapters that confuse you most.',
      },
      cuet: {
        heading: 'Free CUET-UG Commerce Concept Videos',
        subtext:
          'Every video is built for CUET-UG domain prep — start with the subjects that confuse you most.',
      },
    },
  },
  'Study Notes': {
    default: {
      heading: 'Exam-Ready Study Notes — CBSE & Maharashtra HSC',
      subtext:
        'Crisp, syllabus-aligned notes that cut the fluff and keep the marks. Download chapter summaries, formula sheets, and revision notes.',
    },
    byBoard: {
      cbse: {
        heading: 'Exam-Ready CBSE Commerce Study Notes',
        subtext:
          'Crisp, CBSE syllabus-aligned notes — chapter summaries, formula sheets, and revision notes for Accountancy, BST, and Economics.',
      },
      mh: {
        heading: 'Exam-Ready Maharashtra HSC Commerce Study Notes',
        subtext:
          'Crisp, Maharashtra HSC syllabus-aligned notes — chapter summaries, formula sheets, and revision notes for BK, OCM, Economics and SP.',
      },
      cuet: {
        heading: 'CUET-UG Commerce Study Notes',
        subtext:
          'Crisp, CUET-aligned notes — chapter summaries and revision notes for Accountancy, BST, Economics, and Entrepreneurship.',
      },
    },
  },
};

const HERO_CONTENT: Record<string, { title: string; subtitle: string }> = {
  cbse: {
    title: 'Free CBSE Commerce Study Resources',
    subtitle:
      'Hand-picked, exam-ready resources built exclusively for CBSE commerce students. No login required. No catch. Just results.',
  },
  mh: {
    title: 'Free Maharashtra HSC Commerce Study Resources',
    subtitle:
      'Hand-picked, exam-ready resources built exclusively for Maharashtra Board (HSC) commerce students. No login required. No catch. Just results.',
  },
  cuet: {
    title: 'Free CUET-UG Commerce Study Resources',
    subtitle:
      'Hand-picked, exam-ready resources for CUET-UG commerce preparation. No login required. No catch. Just results.',
  },
};

function resolveBoardKey(selectedSlug: string, boardOptions: { slug: string; board: string }[]): string | null {
  if (!selectedSlug) return null;
  const selected = boardOptions.find((o) => o.slug === selectedSlug);
  if (!selected) return null;
  const raw = selected.board.toLowerCase().replace(/\s+/g, '');
  if (raw.includes('cuet')) return 'cuet';
  if (raw.includes('mh') || raw.includes('maharashtra')) return 'mh';
  if (raw.includes('cbse')) return 'cbse';
  return null;
}

// ── Props ──────────────────────────────────────────────────────

interface FreeResourcesPageProps {
  tabNames: string[];
  activeTab: string;
  content: TabContentResponse | null;
  limitReached: boolean;
}

// ── Component ──────────────────────────────────────────────────

export default function FreeResourcesPage({
  tabNames,
  activeTab,
  content,
  limitReached,
}: FreeResourcesPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  const [closeAllPillSelectsSignal, setCloseAllPillSelectsSignal] = useState(0);
  const [videoPlayer, setVideoPlayer] = useState<{
    videoId: string;
    title: string;
  } | null>(null);

  const { selectedSlug, boardOptions: ctxBoardOptions, setSelectedBoard } = useBoardSelection();
  const rootData = useRouteLoaderData('root') as any;
  const isLoggedIn = !!rootData?.activeCustomer?.activeCustomer;
  const effectiveSlug = isLoggedIn ? '' : selectedSlug;
  const boardKey = useMemo(
    () => resolveBoardKey(effectiveSlug, ctxBoardOptions),
    [effectiveSlug, ctxBoardOptions],
  );
  const selected = ctxBoardOptions.find((o) => o.slug === effectiveSlug);
  const classLabel = selected?.class || '';

  const heroTitle = boardKey
    ? `${HERO_CONTENT[boardKey].title}${classLabel ? ` — ${classLabel}` : ''}`
    : 'Free Commerce Study Resources for Class 11 & 12';
  const heroSubtitle = boardKey
    ? HERO_CONTENT[boardKey].subtitle
    : 'Hand-picked, exam-ready resources — built exclusively for CBSE and Maharashtra Board (HSC) commerce students. No login required. No catch. Just results.';

  useEffect(() => {
    if (!videoPlayer) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [videoPlayer]);

  useEffect(() => {
    if (!videoPlayer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideoPlayer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoPlayer]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (closeAllPillSelectsSignal && filtersContainerRef.current) {
        const target = event.target as Node;
        if (!filtersContainerRef.current.contains(target)) {
          setCloseAllPillSelectsSignal(0);
        }
      }
    }
    if (closeAllPillSelectsSignal) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [closeAllPillSelectsSignal]);

  useEffect(() => {
    function handleScroll() {
      if (closeAllPillSelectsSignal) {
        setCloseAllPillSelectsSignal(0);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closeAllPillSelectsSignal]);

  useEffect(() => {
    const filterContainer = filterScrollRef.current;
    if (!filterContainer) return;
    function handleHorizontalScroll() {
      if (closeAllPillSelectsSignal) {
        setCloseAllPillSelectsSignal(0);
      }
    }
    filterContainer.addEventListener('scroll', handleHorizontalScroll, {
      passive: true,
    });
    return () =>
      filterContainer.removeEventListener('scroll', handleHorizontalScroll);
  }, [closeAllPillSelectsSignal]);

  const handleCloseAllPillSelects = () => {
    setCloseAllPillSelectsSignal((prev) => prev + 1);
  };

  const tabStripRef = useRef<HTMLDivElement>(null);

  function navigateToTab(tabName: string) {
    const segment = TAB_SEGMENT_BY_NAME[tabName];
    if (!segment) return;
    navigate(`/free-resources/${segment}`, {
      preventScrollReset: true,
    });
    setTimeout(() => {
      tabStripRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, 50);
  }

  function navigateWithParams(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams);
    params.delete('boardId');
    params.delete('classId');
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }
    if (!('page' in overrides)) params.delete('page');

    const segment = TAB_SEGMENT_BY_NAME[activeTab] ?? 'mock-tests';
    const qs = params.toString();
    navigate(`/free-resources/${segment}${qs ? `?${qs}` : ''}`, {
      preventScrollReset: true,
    });
  }

  // Current filter values from URL
  const currentSubjectId = searchParams.get('subjectId') ?? '';
  const currentChapterNames = searchParams.get('chapterNames') ?? '';
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);
  const currentQ = searchParams.get('q') ?? '';

  // Subject filter options from API
  const subjectOptions = [
    'All Subjects',
    ...(content?.availableSubjects?.map((s) => s.name) ?? []),
  ];
  const selectedSubjectName =
    content?.availableSubjects?.find((s) => s.id === currentSubjectId)?.name ??
    'All Subjects';

  // Chapter filter options from API
  const chapterOptions = ['All Chapters', ...(content?.chapterNames ?? [])];
  const selectedChapter = currentChapterNames || 'All Chapters';

  // Flatten items from grouped subjects response
  const allItems =
    content?.subjects?.flatMap((sg) =>
      sg.items.map((item) => ({ ...item, _subjectName: sg.name })),
    ) ?? [];

  return (
    <div className="bg-[#f7f8ff] md:pb-4 lg:pb-8 4xl:pb-16!">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#edecfd] pt-14 md:pt-36 xl:pt-40">
        <div
          className="pointer-events-none absolute top-0 z-0 h-[min(420px,48vh)] min-h-[220px] opacity-40 sm:min-h-[260px] sm:h-[397px] w-full lg:h-[420px]"
          aria-hidden
        >
          <FreeResourcesHeroSlantSvg />
        </div>
        <div className="relative z-10 pt-14 sm:pt-13 md:pt-16 xl:pt-20 4xl:pt-[172px]!">
          <div className="custom-container pb-8 pt-4 lg:pb-12 4xl:pb-[74px]! 4xl:pt-8!">
            <div className="space-y-3 md:space-y-4 text-lightgray">
              <h1 className="section-heading">{heroTitle}</h1>
              <p className="max-w-[1280px] text-base leading-[150%] text-lightgray sm:text-lg sm:leading-[150%] xl:text-xl xl:leading-[150%]">
                {heroSubtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab strip */}
      <div ref={tabStripRef} className="sticky top-0 z-10 flex w-full border-b border-[rgba(8,22,39,0.08)] bg-white/95 backdrop-blur-md">
        <div className="custom-container flex w-full px-0 sm:px-4 lg:px-6">
          <div className="scrollbar-hide flex min-h-14 px-4 sm:px-0 sm:min-h-18 w-full flex-1 overflow-x-auto">
            {tabNames.map((tabName) => {
              const meta = TAB_META[tabName];
              if (!meta) return null;
              const isActive = tabName === activeTab;
              return (
                <button
                  key={tabName}
                  onClick={() => navigateToTab(tabName)}
                  type="button"
                  className={`flex flex-row items-center justify-center gap-2 sm:gap-4 border-b-[3px] pb-1 sm:pb-2 sm:pb-4 py-2 sm:py-4 px-2 transition-colors w-auto sm:w-52 flex-shrink-0 ${
                    isActive
                      ? `${meta.borderActive} bg-white`
                      : 'border-transparent bg-white hover:bg-[#fafbff]'
                  }`}
                >
                  <div
                    className={`flex size-7 sm:size-12 items-center justify-center overflow-hidden rounded-lg ${meta.iconWrap}`}
                  >
                    {meta.icon}
                  </div>
                  <span
                    className={`inline text-center text-sm font-medium leading-[125%] lg:text-base lg:leading-[125%] xl:leading-[125%] 4xl:text-xl! 4xl:leading-[125%]! ${
                      isActive
                        ? 'sm:font-semibold text-black'
                        : 'font-medium text-lightgray'
                    }`}
                  >
                    {tabName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab-specific SEO heading */}
      {activeTab && TAB_SEO_CONTENT[activeTab] && (() => {
        const tabSeo = TAB_SEO_CONTENT[activeTab];
        const seo = (boardKey && tabSeo.byBoard[boardKey]) || tabSeo.default;
        return (
          <div className="bg-[#f7f8ff] pt-6 pb-2 sm:pt-8 sm:pb-3 lg:pt-10 lg:pb-4">
            <div className="custom-container space-y-2 sm:space-y-3">
              <h2 className="text-xl font-semibold leading-[130%] tracking-tight text-[#081627] sm:text-2xl lg:text-3xl">
                {seo.heading}
              </h2>
              <p className="max-w-[960px] text-sm leading-[160%] text-lightgray sm:text-base lg:text-lg">
                {seo.subtext}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Subject pills bar (mobile) */}
      {content && content.availableSubjects.length > 0 && (
        <div className="md:hidden sticky top-14 sm:top-18 z-20 border-b border-[rgba(8,22,39,0.08)] bg-[#FFFFFF66] py-3 sm:py-4 backdrop-blur-3xl">
          <div className="custom-container flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="scrollbar-hide overflow-x-auto sm:overflow-visible flex items-center gap-2 sm:gap-3 md:gap-3 sm:flex-wrap">
              {content.availableSubjects.map((subj) => {
                const isActive = subj.id === currentSubjectId;
                return (
                  <button
                    key={subj.id}
                    onClick={() =>
                      navigateWithParams({
                        subjectId: isActive ? undefined : subj.id,
                      })
                    }
                    type="button"
                    className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap border flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#3a6bfc] border-[#3a6bfc] text-white'
                        : 'bg-[rgba(8,22,39,0.06)] border-[rgba(8,22,39,0.1)] text-lightgray hover:bg-[rgba(8,22,39,0.1)]'
                    }`}
                  >
                    <span>{subj.name}</span>
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateWithParams({ subjectId: undefined });
                        }}
                        type="button"
                        className="flex items-center justify-center hover:opacity-70 transition-opacity"
                        aria-label={`Remove ${subj.name} filter`}
                      >
                        <svg
                          className="size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div
        ref={filtersContainerRef}
        className="sticky top-14 sm:top-18 z-20 border-b border-[rgba(8,22,39,0.08)] bg-[#FFFFFF66] py-3 sm:py-4 backdrop-blur-3xl"
      >
        <div className="custom-container flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="hidden md:inline text-lg font-medium leading-[150%] tracking-tight text-lightgray sm:text-xl md:leading-[150%] md:tracking-[-0.24px] whitespace-nowrap">
              {activeTab}
              {content && ` (${content.totalCount})`}
            </p>
          </div>
          <div
            ref={filterScrollRef}
            data-pill-wrapper
            className="relative scrollbar-hide overflow-x-auto overflow-y-visible flex items-center gap-2 sm:gap-3 md:gap-3 sm:flex-wrap"
          >
            {/* Board Selector — visible for guests */}
            {!isLoggedIn && ctxBoardOptions.length > 0 && (
              <PillSelect
                value={selected ? `${selected.class} · ${selected.board}` : 'All Boards'}
                options={['All Boards', ...ctxBoardOptions.map((o) => `${o.class} · ${o.board}`)]}
                onChange={(val) => {
                  if (val === 'All Boards') {
                    setSelectedBoard('');
                  } else {
                    const match = ctxBoardOptions.find(
                      (o) => `${o.class} · ${o.board}` === val,
                    );
                    if (match) setSelectedBoard(match.slug);
                  }
                }}
                closeAllPillSelects={handleCloseAllPillSelects}
              />
            )}
            <span className="hidden sm:inline text-sm font-medium leading-[150%] text-lightgray/50 sm:leading-[150%] md:text-base lg:text-base lg:leading-[150%] lg:text-lg shrink-0">
              Filter by:
            </span>

            {/* Subject selector (desktop) */}
            <div className="md:block hidden">
              <PillSelect
                value={selectedSubjectName}
                options={subjectOptions}
                onChange={(val) => {
                  if (val === 'All Subjects') {
                    navigateWithParams({ subjectId: undefined });
                  } else {
                    const subj = content?.availableSubjects?.find(
                      (s) => s.name === val,
                    );
                    if (subj) navigateWithParams({ subjectId: subj.id });
                  }
                }}
                closeAllPillSelects={handleCloseAllPillSelects}
              />
            </div>

            {/* Chapter/Year selector */}
            {chapterOptions.length > 1 && (
              <PillSelect
                value={activeTab === 'Past Papers' ? (currentChapterNames || 'All Years') : selectedChapter}
                options={activeTab === 'Past Papers' ? ['All Years', ...chapterOptions.filter(o => o !== 'All Chapters')] : chapterOptions}
                onChange={(val) => {
                  if (val === 'All Chapters' || val === 'All Years') {
                    navigateWithParams({ chapterNames: undefined });
                  } else {
                    navigateWithParams({ chapterNames: val });
                  }
                }}
                closeAllPillSelects={handleCloseAllPillSelects}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="custom-container py-10 md:py-12">
        {limitReached ? (
          <LimitReachedOverlay />
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#F0F2F7] rounded-full p-4 mb-1">
              <ServerOff className="text-lightgray/50" />
            </div>
            <p className="text-lg font-medium text-lightgray">
              No Resources Found
            </p>
            <p className="mt-2 text-base text-lightgray/60">
              Try changing your filters or selecting a different tab.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {allItems.map((item) => (
                <ContentCardItem
                  key={item.id}
                  item={item}
                  subjectName={item._subjectName}
                  onWatchVideo={(videoId, title) =>
                    setVideoPlayer({ videoId, title })
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {content?.hasNextPage && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    navigateWithParams({
                      page: String(currentPage + 1),
                    })
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(58,107,252,0.2)] bg-white px-8 text-base font-medium text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)]"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video player modal */}
      {videoPlayer && (
        <FreeVideoPlayerModal
          videoId={videoPlayer.videoId}
          title={videoPlayer.title}
          onClose={() => setVideoPlayer(null)}
        />
      )}
    </div>
  );
}

// ── Preserved helper components ────────────────────────────────

function FreeResourcesHeroSlantSvg() {
  const rawId = useId();
  const gid = `fr-hero-grad-${rawId.replace(/:/g, '')}`;
  const bars = [-147, 351, 849, 1347, 1845] as const;
  return (
    <svg
      viewBox="0 0 1920 397"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gid}
          x1="230"
          y1="0"
          x2="230"
          y2="463"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {bars.map((tx) => (
        <rect
          key={tx}
          width="460"
          height="463"
          transform={`matrix(1 0 -0.515038 0.857167 ${tx} 0)`}
          fill={`url(#${gid})`}
        />
      ))}
    </svg>
  );
}

function FreeVideoPlayerModal({
  videoId,
  title,
  onClose,
}: {
  videoId: string;
  title: string;
  onClose: () => void;
}) {
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(8,22,39,0.55)] px-3 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1200px] overflow-hidden rounded-[24px] shadow-[0_26px_53px_rgba(0,0,0,0.55),0_9px_18px_rgba(0,0,0,0.28)]"
        style={{
          background:
            'linear-gradient(135deg, rgb(26, 21, 37) 0%, rgb(42, 53, 69) 50%, rgb(69, 37, 53) 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close video"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex size-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.1)] text-white/90 transition-colors hover:bg-[rgba(255,255,255,0.18)]"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            className="absolute inset-0 size-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}
