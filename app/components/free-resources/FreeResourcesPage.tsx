import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@remix-run/react';
import { Calculator, ChevronDown, Download, Eye, Play, X } from 'lucide-react';
import {
  MetaLineWithBullets,
  metaSepCharClass,
  metaSepDotClass,
} from './metaShared';
import { QUIZ_LIST, type QuizDifficulty } from './quiz/quizData';
import { QuizListingCard } from './quiz/QuizListingCard';
import {
  FormulaCardsIcon,
  FreeVideosIcon,
  MockTestsIcon,
  PastPapersIcon,
  QuizzesIcon,
  StudyNotesIcon,
} from '../new-homepage/Icons';

/** Figma 1:4995 — video card thumbnail */
const IMG_FREE_VIDEO_THUMB =
  'https://www.figma.com/api/mcp/asset/b353da9b-34c2-4e9f-8683-1284119d1c73';

const CarouselArrow = ({
  dir,
  className,
}: {
  dir: 'left' | 'right';
  className?: string;
}) => (
  <svg
    className={`${className ?? ''} ${dir === 'right' ? 'rotate-180' : ''}`}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M15.2651 19.2349C15.3355 19.3053 15.375 19.4007 15.375 19.5002C15.375 19.5997 15.3355 19.6952 15.2651 19.7655C15.1948 19.8359 15.0993 19.8754 14.9998 19.8754C14.9003 19.8754 14.8049 19.8359 14.7345 19.7655L7.23449 12.2655C7.19963 12.2307 7.17197 12.1893 7.1531 12.1438C7.13422 12.0983 7.12451 12.0495 7.12451 12.0002C7.12451 11.9509 7.13422 11.9021 7.1531 11.8566C7.17197 11.8111 7.19963 11.7697 7.23449 11.7349L14.7345 4.2349C14.7693 4.20005 14.8107 4.17242 14.8562 4.15356C14.9017 4.1347 14.9505 4.125 14.9998 4.125C15.0491 4.125 15.0979 4.1347 15.1434 4.15356C15.1889 4.17242 15.2303 4.20005 15.2651 4.2349C15.3 4.26974 15.3276 4.3111 15.3465 4.35662C15.3653 4.40214 15.375 4.45094 15.375 4.50021C15.375 4.54948 15.3653 4.59827 15.3465 4.64379C15.3276 4.68932 15.3 4.73068 15.2651 4.76552L8.03043 12.0002L15.2651 19.2349Z"
      fill="currentColor"
    />
  </svg>
);

const TapExpandArrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M7.27866 16.0291C7.22002 16.0877 7.18708 16.1672 7.18708 16.2502C7.18708 16.3331 7.22002 16.4126 7.27866 16.4713C7.3373 16.5299 7.41683 16.5628 7.49975 16.5628C7.58268 16.5628 7.66221 16.5299 7.72085 16.4713L13.9708 10.2213C13.9999 10.1922 14.023 10.1578 14.0387 10.1198C14.0544 10.0819 14.0625 10.0412 14.0625 10.0002C14.0625 9.95911 14.0544 9.91844 14.0387 9.88051C14.023 9.84257 13.9999 9.8081 13.9708 9.77908L7.72085 3.52908C7.69181 3.50005 7.65734 3.47701 7.61941 3.4613C7.58147 3.44559 7.54082 3.4375 7.49975 3.4375C7.45869 3.4375 7.41803 3.44559 7.3801 3.4613C7.34216 3.47701 7.30769 3.50005 7.27866 3.52908C7.24963 3.55811 7.22659 3.59258 7.21088 3.63052C7.19517 3.66845 7.18708 3.70911 7.18708 3.75017C7.18708 3.79123 7.19517 3.83189 7.21088 3.86983C7.22659 3.90776 7.24963 3.94223 7.27866 3.97127L13.3076 10.0002L7.27866 16.0291Z"
      fill="currentColor"
    />
  </svg>
);

export type TabId =
  | 'mock'
  | 'formula'
  | 'notes'
  | 'papers'
  | 'quizzes'
  | 'videos';

const TAB_PATH_BY_ID: Record<TabId, string> = {
  mock: '/free-resources/mock-tests',
  formula: '/free-resources/formula-cards',
  notes: '/free-resources/study-notes',
  papers: '/free-resources/past-papers',
  quizzes: '/free-resources/quizzes',
  videos: '/free-resources/free-videos',
};

const resources = [
  {
    title: 'Study Notes',
    icon: <StudyNotesIcon classname="max-w-6" />,
    bgColor: 'bg-[#EEF2FF]',
  },
  {
    title: 'Mock Tests',
    icon: <MockTestsIcon />,
    bgColor: 'bg-[#FFEEF8]',
  },
  {
    title: 'Past Papers',
    icon: <PastPapersIcon />,
    bgColor: 'bg-[#EDF9FF]',
  },
  {
    title: 'Formula Cards',
    icon: <FormulaCardsIcon />,
    bgColor: 'bg-[#FAEEFF]',
  },
  {
    title: 'Quizzes',
    icon: <QuizzesIcon />,
    bgColor: 'bg-[#FFF1EE]',
  },
  {
    title: 'Free Videos',
    icon: <FreeVideosIcon />,
    bgColor: 'bg-[#EEF0FF]',
  },
];

const TABS: Array<{
  id: TabId;
  label: string;
  count: number;
  borderActive: string;
  iconWrap: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'mock',
    label: 'Mock Tests',
    count: 230,
    borderActive: 'border-[#f5a0ad]',
    iconWrap: 'bg-[#ffeef8]',
    icon: resources[1].icon,
  },
  {
    id: 'formula',
    label: 'Formula Cards',
    count: 120,
    borderActive: 'border-[#b794d4]',
    iconWrap: 'bg-[#faeeff]',
    icon: resources[3].icon,
  },
  {
    id: 'notes',
    label: 'Study Notes',
    count: 42,
    borderActive: 'border-[#B9C9FF]',
    iconWrap: 'bg-[#eef2ff]',
    icon: resources[0].icon,
  },
  {
    id: 'papers',
    label: 'Past Papers',
    count: 120,
    borderActive: 'border-[#7ec8ee]',
    iconWrap: 'bg-[#edf9ff]',
    icon: resources[2].icon,
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    count: 50,
    borderActive: 'border-[#f0a090]',
    iconWrap: 'bg-[#fff1ee]',
    icon: resources[4].icon,
  },
  {
    id: 'videos',
    label: 'Free Videos',
    count: 500,
    borderActive: 'border-[#8aadd4]',
    iconWrap: 'bg-[#eef0ff]',
    icon: resources[5].icon,
  },
];

type SubjectPill = {
  label: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
};

type ResourceCard = {
  subject: SubjectPill;
  board: string;
  title: string;
  chapter: number;
  /** Past Papers / mock listing — one line, bullets (Figma) */
  meta: string;
};

type StudyNoteCard = {
  subject: SubjectPill;
  board: string;
  title: string;
  chapter: number;
  metaLeft: string;
  metaRight: string;
  year: string;
};

type FormulaCard = {
  subject: SubjectPill;
  board: string;
  title: string;
  chapter: number;
  formula: string;
  gradient: string;
  detail?: string;
};

const RESOURCE_CARDS: ResourceCard[] = [
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    board: 'CBSE',
    chapter: 1,
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    board: 'MH Board',
    chapter: 1,
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'MH Board',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'Business Studies',
      dot: 'bg-[#ba7517]',
      bg: 'bg-[rgba(186,117,23,0.05)]',
      border: 'border-[rgba(186,117,23,0.1)]',
      text: 'text-[#ba7517]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'OCM',
      dot: 'bg-[#7b36ec]',
      bg: 'bg-[rgba(123,54,236,0.05)]',
      border: 'border-[rgba(123,54,236,0.1)]',
      text: 'text-[#7b36ec]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'Maths',
      dot: 'bg-[#4a6fa5]',
      bg: 'bg-[rgba(74,111,165,0.05)]',
      border: 'border-[rgba(74,111,165,0.1)]',
      text: 'text-[#4a6fa5]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
  {
    subject: {
      label: 'SP & Marketing',
      dot: 'bg-[#e04848]',
      bg: 'bg-[rgba(224,72,72,0.05)]',
      border: 'border-[rgba(224,72,72,0.1)]',
      text: 'text-[#e04848]',
    },
    chapter: 1,

    board: 'CBSE',
    title: '2025 Set 1 (651/1)',
    meta: '32 Questions • 80 Marks • 180 Minutes',
  },
];

const FORMULA_CARDS: FormulaCard[] = [
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,
    board: 'CBSE',
    title: 'Gross Profit Ratio',
    formula: 'GP Ratio =\n(Gross Profit/Net Sales) X 100',
    gradient: 'bg-[#1764d4]',
    detail:
      'Net Profit (after tax)\n\nAdd: Depreciation, Goodwill w/off\nAdd: Non-operating losses\nLess: Non-operating gains\n= Operating Profit before WC changes\n\nAdd: Decrease in CA / Increase in CL\nLess: Increase in CA / Decrease in CL\n= Cash from Operations\n\nLess: Tax Paid\n= Cash Flow from Operating Activities',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'Net Profit Ratio',
    formula: 'NP Ratio =\n(Net Profit/Net Sales) X 100',
    gradient:
      'bg-[linear-gradient(107deg,#17c994_0.41%,#0e9a70_49.93%,#17c994_99.46%)]',
    detail:
      'Net Profit (after tax)\n\nAdd: Depreciation, Goodwill w/off\nAdd: Non-operating losses\nLess: Non-operating gains\n= Operating Profit before WC changes',
  },
  {
    subject: {
      label: 'Maths',
      dot: 'bg-[#4a6fa5]',
      bg: 'bg-[rgba(74,111,165,0.05)]',
      border: 'border-[rgba(74,111,165,0.1)]',
      text: 'text-[#4a6fa5]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'GDP at Market Price',
    formula: 'GP Ratio =\n(Gross Profit/Net Sales) X 100',
    gradient:
      'bg-[linear-gradient(107deg,#5c80b6_0.41%,#4a6fa5_49.93%,#5c80b6_99.46%)]',
    detail:
      'Net Profit (after tax)\n\nAdd: Depreciation, Goodwill w/off\nAdd: Non-operating losses\nLess: Non-operating gains\n= Operating Profit before WC changes',
  },
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'Return on Investment',
    formula: 'ROI =\n(Net Profit/Cost of Investment) X 100',
    gradient:
      'bg-[linear-gradient(107deg,#3677e0_0.41%,#1764d4_49.93%,#3677e0_99.46%)]',
    detail:
      'ROI = (Net Profit / Cost of Investment) X 100\n\nUse this to evaluate business performance against capital deployed.',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'Standard Deviation',
    formula: 'SD = √(Σ(Xi - μ)²/N)',
    gradient:
      'bg-[linear-gradient(107deg,#17c994_0.41%,#0e9a70_49.93%,#17c994_99.46%)]',
    detail:
      'SD = √(Σ(Xi - μ)²/N)\n\nStandard deviation measures spread of values around mean.',
  },
  {
    subject: {
      label: 'Maths',
      dot: 'bg-[#4a6fa5]',
      bg: 'bg-[rgba(74,111,165,0.05)]',
      border: 'border-[rgba(74,111,165,0.1)]',
      text: 'text-[#4a6fa5]',
    },
    board: 'CBSE',
    chapter: 1,
    title: 'GDP at Market Price',
    formula: 'GP Ratio =\n(Gross Profit/Net Sales) X 100',
    gradient:
      'bg-[linear-gradient(107deg,#5c80b6_0.41%,#4a6fa5_49.93%,#5c80b6_99.46%)]',
    detail:
      'GDP at MP = Private Consumption + Gross Investment + Govt. Spending + (Exports - Imports)',
  },
];

const STUDY_NOTES_CARDS: StudyNoteCard[] = [
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2023 — Accountancy',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Chapter notes · PDF',
    year: '2023',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'MH Board',
    title: 'CBSE 2024 — Economics',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: '24 pages · PDF',
    year: '2024',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'MH Board',
    title: 'MH Board 2024 — Book-keeping & Acc.',
    metaLeft: 'Full syllabus',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
  {
    subject: {
      label: 'Business Studies',
      dot: 'bg-[#ba7517]',
      bg: 'bg-[rgba(186,117,23,0.05)]',
      border: 'border-[rgba(186,117,23,0.1)]',
      text: 'text-[#ba7517]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2024 — Business Studies',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2023 — Economics',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2023',
  },
  {
    subject: {
      label: 'OCM',
      dot: 'bg-[#7b36ec]',
      bg: 'bg-[rgba(123,54,236,0.05)]',
      border: 'border-[rgba(123,54,236,0.1)]',
      text: 'text-[#7b36ec]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'OCM 2025 — Ratio Analysis',
    metaLeft: '18 pages',
    metaRight: 'PDF',
    year: '2025',
  },
];

/** Figma 1:4649 — `2_Free Resources_Past papers` (View + Download, split meta, outlined board chip) */
const PAST_PAPER_CARDS: StudyNoteCard[] = [
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2024 — Accountancy',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'MH Board',
    title: 'CBSE 2023 — Accountancy',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2023',
  },
  {
    subject: {
      label: 'English',
      dot: 'bg-[#6b7c5e]',
      bg: 'bg-[rgba(107,124,94,0.05)]',
      border: 'border-[rgba(107,124,94,0.1)]',
      text: 'text-[#6b7c5e]',
    },
    chapter: 1,

    board: 'MH Board',
    title: 'CBSE 2024 — Economics',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
  {
    subject: {
      label: 'Business Studies',
      dot: 'bg-[#ba7517]',
      bg: 'bg-[rgba(186,117,23,0.05)]',
      border: 'border-[rgba(186,117,23,0.1)]',
      text: 'text-[#ba7517]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2023 — Economics',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2023',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'CBSE 2024 — Business Studies',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
  {
    subject: {
      label: 'OCM',
      dot: 'bg-[#7b36ec]',
      bg: 'bg-[rgba(123,54,236,0.05)]',
      border: 'border-[rgba(123,54,236,0.1)]',
      text: 'text-[#7b36ec]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'MH Board 2024 — Book-keeping & Acc.',
    metaLeft: 'Set 1 (65/1/1)',
    metaRight: 'Compartment Paper',
    year: '2024',
  },
];

/** Primary demo embed — [YouTube](https://youtu.be/LDQT1lvwn_c) */
const DEMO_YOUTUBE_VIDEO_ID = 'LDQT1lvwn_c';
const DEMO_VIDEO_HANDOUT_PATH = '/free-resources/video-handout-sample.txt';

/** Figma 1:4995 — Free Videos listing */
type FreeVideoCard = {
  subject: SubjectPill;
  board: string;
  chapter: number;
  title: string;
  durationLabel: string;
  durationMinutes: number;
  year: string;
  thumb?: string;
  /** Opens Figma `1:5375` player modal with YouTube embed */
  youtubeId?: string;
  /** Same-origin path or absolute URL for Download (filename used when same-origin). */
  downloadUrl?: string;
  downloadFilename?: string;
};

function triggerBrowserDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function youtubePosterUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function freeVideoThumbSrc(card: FreeVideoCard) {
  if (card.thumb) return card.thumb;
  if (card.youtubeId) return youtubePosterUrl(card.youtubeId);
  return IMG_FREE_VIDEO_THUMB;
}

const SUBJ_MATHEMATICS: SubjectPill = {
  label: 'Mathematics',
  dot: 'bg-[#1764d4]',
  bg: 'bg-[rgba(23,100,212,0.05)]',
  border: 'border-[rgba(23,100,212,0.1)]',
  text: 'text-[#1764d4]',
};

const SUBJ_PHYSICS: SubjectPill = {
  label: 'Physics',
  dot: 'bg-[#4a6fa5]',
  bg: 'bg-[rgba(74,111,165,0.05)]',
  border: 'border-[rgba(74,111,165,0.1)]',
  text: 'text-[#4a6fa5]',
};

const FREE_VIDEO_CARDS: FreeVideoCard[] = [
  {
    subject: SUBJ_MATHEMATICS,
    board: 'ICSE',
    chapter: 1,
    title:
      'ICSE Class 10 Mathematics — Complete Revision: Algebra, Geometry & Statistics',
    durationLabel: '45:30',
    durationMinutes: 45.5,
    year: '2024',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'icse-maths-handout.txt',
  },
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,

    board: 'CBSE',
    title:
      'Past Year Board Papers — Accountancy (Set-wise solutions walkthrough)',
    durationLabel: '30:20',
    durationMinutes: 30.33,
    year: '2024',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'accountancy-handout.txt',
  },
  {
    subject: {
      label: 'Accountancy',
      dot: 'bg-[#1764d4]',
      bg: 'bg-[rgba(23,100,212,0.05)]',
      border: 'border-[rgba(23,100,212,0.1)]',
      text: 'text-[#1764d4]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'Partnership Accounts — Admission of a Partner (Numericals)',
    durationLabel: '28:10',
    durationMinutes: 28.17,
    year: '2025',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'partnership-accounts-handout.txt',
  },
  {
    subject: SUBJ_PHYSICS,
    board: 'IB',
    chapter: 1,
    title: 'IB Physics — Practice Papers & Marking Scheme Overview',
    durationLabel: '50:15',
    durationMinutes: 50.25,
    year: '2024',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'ib-physics-handout.txt',
  },
  {
    subject: SUBJ_MATHEMATICS,
    board: 'CBSE',
    chapter: 1,

    title: 'CBSE Class 12 — Calculus: Application of Derivatives (PYQs)',
    durationLabel: '62:00',
    durationMinutes: 62,
    year: '2023',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'calculus-handout.txt',
  },
  {
    subject: {
      label: 'Economics',
      dot: 'bg-[#0baf7e]',
      bg: 'bg-[rgba(11,175,126,0.05)]',
      border: 'border-[rgba(11,175,126,0.1)]',
      text: 'text-[#0baf7e]',
    },
    chapter: 1,

    board: 'CBSE',
    title: 'National Income & Related Aggregates — One-shot revision',
    durationLabel: '38:45',
    durationMinutes: 38.75,
    year: '2025',
    youtubeId: DEMO_YOUTUBE_VIDEO_ID,
    downloadUrl: DEMO_VIDEO_HANDOUT_PATH,
    downloadFilename: 'economics-handout.txt',
  },
];

function durationMatchesFilter(
  minutes: number,
  filter: (typeof DURATION_OPTIONS)[number],
): boolean {
  switch (filter) {
    case 'All Duration':
      return true;
    case 'Under 30 min':
      return minutes < 30;
    case '30–45 min':
      return minutes >= 30 && minutes < 45;
    case '45–60 min':
      return minutes >= 45 && minutes < 60;
    case '60+ min':
      return minutes >= 60;
    default:
      return true;
  }
}

const SUBJECT_OPTIONS = [
  'All Subjects',
  'Accountancy',
  'English',
  'Economics',
  'Business Studies',
  'Maths',
  'Mathematics',
  'OCM',
  'Physics',
];
const CHAPTER_OPTIONS = [
  'All Chapters',
  'Chapter 1',
  'Chapter 2',
  'Chapter 3',
  'Full syllabus',
];

const YEAR_OPTIONS = ['All Years', '2023', '2024', '2025'];

const BOARD_OPTIONS = ['All Boards', 'CBSE', 'MH Board'];

const DURATION_OPTIONS = [
  'All Duration',
  'Under 30 min',
  '30–45 min',
  '45–60 min',
  '60+ min',
] as const;

const DIFFICULTY_OPTIONS = [
  'All Difficulties',
  'Easy',
  'Medium',
  'Hard',
] as const;

/** Figma — skewed bar hero (viewBox 1920×397, bars 460×463 + matrix skew) */
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

/** Figma 1:5375 — centered player modal (gradient shell, shadow, close, YouTube iframe). */
function FreeVideoPlayerModal({
  youtubeId,
  title,
  onClose,
}: {
  youtubeId: string;
  title: string;
  onClose: () => void;
}) {
  const src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
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

/** Figma 1:4995 — Free Videos card (16:9 thumb, play, duration chip, Watch / Download). */
function FreeVideoListingCard({
  subject,
  board,
  title,
  chapter,
  durationLabel,
  thumbSrc,
  youtubeId,
  onWatch,
  downloadUrl,
  downloadFilename,
}: {
  subject: SubjectPill;
  board: string;
  title: string;
  chapter: number;
  durationLabel: string;
  thumbSrc: string;
  youtubeId?: string;
  onWatch?: () => void;
  downloadUrl?: string;
  downloadFilename?: string;
}) {
  const canWatch = Boolean(youtubeId && onWatch);
  const canDownload = Boolean(downloadUrl);

  return (
    <article className="flex flex-col gap-4 sm:gap-6 overflow-hidden rounded-2xl bg-white p-4 sm:p-5 xl:p-6 ">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#081627]">
        <button
          type="button"
          disabled={!canWatch}
          onClick={() => canWatch && onWatch?.()}
          className={`relative block size-full text-left ${
            canWatch ? 'cursor-pointer' : 'cursor-default'
          }`}
          aria-label={canWatch ? `Play video: ${title}` : undefined}
        >
          <img
            src={thumbSrc}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-[#081627]/25" aria-hidden />
          <div className="absolute left-1/2 top-1/2 flex size-[40px] sm:size-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-400 bg-gray-500">
            <Play fill="#FFFFFF" className="text-white w-4 sm:w-5" />
          </div>
          <div className="pointer-events-none absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 rounded-full border border-white/15 bg-white/15 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm font-medium leading-[150%] text-white backdrop-blur-[17px] sm:text-base sm:leading-[150%]">
            {durationLabel}
          </div>
        </button>
      </div>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm leading-[150%] lg:text-base lg:leading-[150%]">
          <div
            className={`flex items-center gap-2 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium leading-[150%] lg:text-base lg:leading-[150%] ${subject.bg} ${subject.border} ${subject.text}`}
          >
            <span
              className={`size-1.5 sm:size-2 shrink-0 rounded-full ${subject.dot}`}
            />
            {subject.label}
          </div>
          <div className="rounded border border-[rgba(8,22,39,0.1)] px-2 sm:px-3 py-0.5 sm:py-1 font-medium leading-[150%] text-lightgray/50 text-xs sm:text-sm lg:text-base lg:leading-[150%]">
            {board}
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-lightgray/50">
          CHAPTER {chapter}
        </p>
        <h2 className="line-clamp-2 text-lg sm:text-xl font-medium leading-[150%] tracking-[-0.24px] text-lightgray lg:leading-[150%]">
          {title}
        </h2>
      </div>
      <div className="mt-auto flex w-full gap-2 sm:gap-3">
        <button
          type="button"
          disabled={!canWatch}
          onClick={() => canWatch && onWatch?.()}
          className={`flex h-8 sm:h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-xs sm:text-sm font-medium leading-[150%] text-[#3a6bfc] transition-colors lg:text-base lg:leading-[150%] ${
            canWatch
              ? 'hover:bg-[rgba(58,107,252,0.06)]'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <Play
            className="size-4 sm:size-5 shrink-0 fill-current"
            strokeWidth={0}
          />
          Watch Now
        </button>
        <button
          type="button"
          disabled={!canDownload}
          onClick={() =>
            downloadUrl &&
            triggerBrowserDownload(downloadUrl, downloadFilename ?? 'download')
          }
          className={`flex h-8 sm:h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[#0816271A] bg-white text-xs sm:text-sm font-medium leading-[150%] text-gray-700 transition-colors lg:text-base lg:leading-[150%] ${
            canDownload
              ? 'hover:bg-[rgba(58,107,252,0.06)]'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <Download className="size-4 sm:size-5 shrink-0" />
          Download
        </button>
      </div>
    </article>
  );
}

/** Tag row matches Formula Cards grid: subject `rounded-full`, board `rounded` + border, `text-sm lg:text-base`. */
function FigmaListingCard({
  tab,
  subject,
  board,
  title,
  chapter,
  metaLine,
  metaLeft,
  metaRight,
  footer,
}: {
  tab: string;
  subject: SubjectPill;
  board: string;
  title: string;
  chapter: number;
  footer: React.ReactNode;
  /** Mock / Quizzes / Free Videos — one line (not used on Past Papers tab; see PAST_PAPER_CARDS). */
  metaLine?: string;
  /** Figma cards — two segments with centre dot */
  metaLeft?: string;
  metaRight?: string;
}) {
  const metaBlock =
    metaLine != null ? (
      <MetaLineWithBullets
        text={metaLine}
        className="line-clamp-2 text-sm font-medium leading-[150%] text-lightgray/50 lg:text-base lg:leading-[150%]"
      />
    ) : (
      <div className="flex min-w-0 items-center gap-2 text-sm leading-[150%] lg:text-base lg:leading-[150%]">
        <span className="min-w-0 truncate font-medium leading-[150%] text-lightgray/50">
          {metaLeft!}
        </span>
        <span className={metaSepDotClass} aria-hidden />
        <span className="min-w-0 truncate font-medium leading-[150%] text-lightgray/50">
          {metaRight!}
        </span>
      </div>
    );

  return (
    <article className="flex flex-col justify-between overflow-hidden gap-16 rounded-2xl bg-white py-6 ring-1 ring-[rgba(8,22,39,0.06)]">
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2 text-sm leading-[150%] px-6 lg:text-base lg:leading-[150%]">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm md:text-base font-medium leading-[150%] lg:text-base lg:leading-[150%] ${subject.bg} ${subject.border} ${subject.text}`}
          >
            <span className={`size-2 shrink-0 rounded-full ${subject.dot}`} />
            {subject.label}
          </div>
          <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 font-medium leading-[150%] text-lightgray/50 text-sm lg:text-base lg:leading-[150%]">
            {board}
          </div>
        </div>
        <div className="px-6">
          <p className="text-sm font-medium text-lightgray/50">
            CHAPTER {chapter}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col px-6">
          <h2 className="line-clamp-1 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
            {title}
          </h2>
        </div>
        <div className="px-6">{metaBlock}</div>
      </div>
      {footer}
    </article>
  );
}

function PillSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updateMenuRect = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ top: r.bottom + 6, left: r.left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuRect();
    const onReposition = () => updateMenuRect();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  const portal =
    open &&
    menuRect &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 z-1000 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
        <div
          role="listbox"
          className="scrollbar-hide fixed z-1001 flex w-max max-h-60 min-w-0 flex-col overflow-y-auto rounded-xl text-gray-700 border border-lightgray/10 bg-white shadow-lg"
          style={{
            top: menuRect.top,
            left: menuRect.left,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              className={`w-full whitespace-nowrap px-4 py-2.5 text-left text-base leading-[150%] ${
                opt === value
                  ? 'bg-lightgray/5 font-medium text-lightgray'
                  : 'text-lightgray/80 hover:bg-lightgray/5'
              }`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </>,
      document.body,
    );

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-full border border-[rgba(8,22,39,0.1)] bg-white px-3 py-2 text-base font-medium leading-[150%] text-lightgray sm:px-4 sm:leading-[150%]"
      >
        <span className="max-w-[140px] truncate">{value}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>
      {portal}
    </div>
  );
}

export default function FreeResourcesPage({
  initialTab = 'mock',
}: {
  initialTab?: TabId;
}) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [subject, setSubject] = useState('All Subjects');
  const [chapter, setChapter] = useState('All Chapters');
  const [year, setYear] = useState('All Years');
  const [board, setBoard] = useState('All Boards');
  const [quizDifficulty, setQuizDifficulty] =
    useState<string>('All Difficulties');
  const [videoDuration, setVideoDuration] =
    useState<(typeof DURATION_OPTIONS)[number]>('All Duration');
  const [expandedFormula, setExpandedFormula] = useState<FormulaCard | null>(
    null,
  );
  const [videoPlayer, setVideoPlayer] = useState<{
    youtubeId: string;
    title: string;
  } | null>(null);
  const relatedCarouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const modalOpen = expandedFormula != null || videoPlayer != null;
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [expandedFormula, videoPlayer]);

  useEffect(() => {
    if (!videoPlayer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideoPlayer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoPlayer]);

  const scrollRelated = (dir: 'prev' | 'next') => {
    const el = relatedCarouselRef.current;
    if (!el) return;
    const child = el.querySelector<HTMLElement>('[data-related-card]');
    const cardWidth = child?.offsetWidth ?? 360;
    const gap = 16; // gap-4
    const delta = (cardWidth + gap) * (window.innerWidth < 640 ? 1 : 2);
    el.scrollBy({ left: dir === 'next' ? delta : -delta, behavior: 'smooth' });
  };

  const active = useMemo(() => TABS.find((t) => t.id === tab)!, [tab]);

  const filteredCards = useMemo(() => {
    if (subject === 'All Subjects') return RESOURCE_CARDS;
    return RESOURCE_CARDS.filter((c) => c.subject.label === subject);
  }, [subject]);

  const filteredFormulaCards = useMemo(() => {
    if (subject === 'All Subjects') return FORMULA_CARDS;
    return FORMULA_CARDS.filter((c) => c.subject.label === subject);
  }, [subject]);

  const filteredStudyNotesCards = useMemo(() => {
    let list = STUDY_NOTES_CARDS;
    if (subject !== 'All Subjects') {
      list = list.filter((c) => c.subject.label === subject);
    }
    if (year !== 'All Years') {
      list = list.filter((c) => c.year === year);
    }
    return list;
  }, [subject, year]);

  const filteredPastPaperCards = useMemo(() => {
    let list = PAST_PAPER_CARDS;
    if (subject !== 'All Subjects') {
      list = list.filter((c) => c.subject.label === subject);
    }
    if (year !== 'All Years') {
      list = list.filter((c) => c.year === year);
    }
    return list;
  }, [subject, year]);

  const filteredQuizCards = useMemo(() => {
    let list = QUIZ_LIST;
    if (subject !== 'All Subjects') {
      list = list.filter((c) => c.subject.label === subject);
    }
    if (quizDifficulty !== 'All Difficulties') {
      const map: Record<string, QuizDifficulty> = {
        Easy: 'easy',
        Medium: 'medium',
        Hard: 'hard',
      };
      const d = map[quizDifficulty];
      if (d) list = list.filter((c) => c.difficulty === d);
    }
    return list;
  }, [subject, quizDifficulty]);

  const filteredFreeVideos = useMemo(() => {
    let list = FREE_VIDEO_CARDS;
    if (subject !== 'All Subjects') {
      list = list.filter((c) => c.subject.label === subject);
    }
    if (year !== 'All Years') {
      list = list.filter((c) => c.year === year);
    }
    list = list.filter((c) =>
      durationMatchesFilter(c.durationMinutes, videoDuration),
    );
    return list;
  }, [subject, year, videoDuration]);

  return (
    <div className="bg-[#f7f8ff] md:pb-4 lg:pb-8 4xl:pb-16!">
      {/* Hero band + tab strip — slant bars SVG (1920×397), responsive height */}
      <section className="relative overflow-hidden bg-[#edecfd] pt-14 md:pt-36 xl:pt-40">
        <div
          className="pointer-events-none absolute -left-24 top-0 z-0 h-[min(420px,48vh)] min-h-[220px]  opacity-40 sm:min-h-[260px] sm:h-[397px] md:left-1/2 md:w-screen  md:-translate-x-1/2 lg:h-[420px]"
          aria-hidden
        >
          <FreeResourcesHeroSlantSvg />
        </div>

        <div className="relative z-10 pt-14 sm:pt-13 md:pt-16 xl:pt-20 4xl:pt-[172px]!">
          <div className="custom-container pb-8 pt-4 lg:pb-12 4xl:pb-[74px]! 4xl:pt-8!">
            <div className="space-y-3 md:space-y-4 text-lightgray">
              <h1 className="section-heading">Free Resources</h1>
              <p className="max-w-[1280px] text-base leading-[150%] text-lightgray sm:text-lg sm:leading-[150%] xl:text-xl xl:leading-[150%]">
                Test your knowledge with code challenges based on real-world
                technical interviews from companies like Google, Amazon, and
                Meta. Practice for your job search — or for fun. Don’t worry if
                you get stuck. We’ll recommend the right courses to help you.
              </p>
            </div>
          </div>

          <div className="sticky top-0 z-30 flex w-full border-b border-[rgba(8,22,39,0.08)] bg-white/95 backdrop-blur-md">
            <div className="custom-container flex w-full px-0 sm:px-4 lg:px-6">
              <div className="scrollbar-hide flex min-h-14 sm:min-h-18 w-full flex-1 overflow-x-auto">
                {TABS.map((t) => {
                  const isActive = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      type="button"
                      className={`flex flex-row items-center justify-center gap-2 sm:gap-4 border-b-[3px] pb-1 sm:pb-2 sm:pb-4 py-2 sm:py-4 px-2 sm:px-4 transition-colors w-auto sm:w-[260px] flex-shrink-0 ${
                        isActive
                          ? `${t.borderActive} bg-white`
                          : 'border-transparent bg-white hover:bg-[#fafbff]'
                      }`}
                    >
                      <div
                        className={`flex size-8 sm:size-12 items-center justify-center overflow-hidden rounded-lg ${t.iconWrap}`}
                      >
                        {t.icon}
                      </div>
                      <span
                        className={`hidden sm:inline text-center text-base font-medium leading-[125%] lg:text-base lg:leading-[125%] xl:text-lg xl:leading-[125%] 4xl:text-xl! 4xl:leading-[125%]! ${
                          t.id === 'mock' && isActive
                            ? 'font-semibold text-lightgray'
                            : 'font-medium text-lightgray'
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[rgba(8,22,39,0.08)] bg-[#FFFFFF66] py-3 sm:py-4 backdrop-blur-md">
        <div className="custom-container flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-medium leading-[150%] tracking-tight text-lightgray sm:text-xl md:leading-[150%] md:tracking-[-0.24px]">
            {active.label} ({active.count})
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-3">
            <span className="hidden sm:inline text-sm font-medium leading-[150%] text-lightgray/50 sm:leading-[150%] md:text-base lg:text-base lg:leading-[150%] lg:text-lg">
              Filter by:
            </span>
            <PillSelect
              value={subject}
              options={SUBJECT_OPTIONS}
              onChange={setSubject}
            />
            <PillSelect
              value={board}
              options={BOARD_OPTIONS}
              onChange={setBoard}
            />
            {tab === 'notes' || tab === 'papers' ? (
              <PillSelect
                value={year}
                options={YEAR_OPTIONS}
                onChange={setYear}
              />
            ) : tab === 'quizzes' ? (
              <PillSelect
                value={quizDifficulty}
                options={[...DIFFICULTY_OPTIONS]}
                onChange={setQuizDifficulty}
              />
            ) : tab === 'videos' ? (
              <>
                <PillSelect
                  value={year}
                  options={YEAR_OPTIONS}
                  onChange={setYear}
                />
                <PillSelect
                  value={videoDuration}
                  options={[...DURATION_OPTIONS]}
                  onChange={(v) =>
                    setVideoDuration(v as (typeof DURATION_OPTIONS)[number])
                  }
                />
              </>
            ) : (
              <PillSelect
                value={chapter}
                options={CHAPTER_OPTIONS}
                onChange={setChapter}
              />
            )}
          </div>
        </div>
      </div>

      <div className="custom-container py-10 md:py-12">
        {tab === 'formula' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFormulaCards.map((card, i) => (
              <article
                key={`${card.title}-${card.subject.label}-${i}`}
                className="rounded-2xl flex flex-col gap-4 sm:gap-6 bg-white p-4 sm:p-6 ring-1 ring-[rgba(8,22,39,0.06)]"
              >
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base">
                    <div
                      className={`flex items-center gap-2 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm lg:text-base font-medium ${card.subject.bg} ${card.subject.border} ${card.subject.text}`}
                    >
                      <span
                        className={`size-1.5 sm:size-2 shrink-0 rounded-full ${card.subject.dot}`}
                      />
                      {card.subject.label}
                    </div>
                    <div className="rounded border border-[rgba(8,22,39,0.1)] px-2 sm:px-3 py-0.5 sm:py-1 font-medium text-lightgray/50 text-xs sm:text-sm lg:text-base">
                      {card.board}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-lightgray/50">
                    CHAPTER {card.chapter}
                  </p>
                  <h2 className="text-lg sm:text-xl font-medium tracking-tight text-lightgray">
                    {card.title}
                  </h2>
                </div>

                {/* card */}
                <div
                  className={`h-[90px] sm:h-[130px] w-[min(100%,378.66668701171875px)] rounded-2xl ${card.gradient} flex items-center justify-center overflow-hidden mx-auto`}
                >
                  <div className="grid h-[80px] sm:h-[114px] w-full grid-cols-[0.5fr_auto_0.5fr] sm:grid-cols-[1fr_auto_1fr] gap-1 sm:gap-2">
                    {/* left card */}
                    <div className="rounded-r-xl w-full bg-white/25 blur-[2px]" />
                    {/* center card */}
                    <div className="rounded-xl w-[min(100%,180px)] sm:w-[260px] bg-white/30 p-2 sm:p-3 flex items-center">
                      <p className="text-white text-xs sm:text-sm font-semibold leading-[125%] whitespace-pre-line sm:text-base sm:leading-[125%]">
                        {card.formula}
                      </p>
                    </div>
                    {/* right card */}
                    <div className="rounded-l-xl w-full bg-white/25 blur-[2px]" />
                  </div>
                </div>
                {/* footer */}
                <button
                  type="button"
                  onClick={() => setExpandedFormula(card)}
                  className="flex w-full items-center justify-center gap-1 rounded-full border border-[#0816271A] py-2 text-sm font-medium leading-[150%] text-gray-700 transition-colors hover:bg-[rgba(58,107,252,0.06)]"
                >
                  Tap to Expand{' '}
                  <TapExpandArrow className="ml-1 text-gray-700" />
                </button>
              </article>
            ))}
          </div>
        ) : tab === 'notes' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStudyNotesCards.map((card, i) => (
              <FigmaListingCard
                tab={tab}
                key={`${card.title}-${card.subject.label}-${i}`}
                subject={card.subject}
                board={card.board}
                title={card.title}
                chapter={card.chapter}
                metaLeft={card.metaLeft}
                metaRight={card.metaRight}
                footer={
                  <div className="flex w-full gap-3 px-6">
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium leading-[150%] text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                    >
                      <Eye className="size-5 shrink-0" />
                      View
                    </button>
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[#0816271A] bg-white text-sm font-medium leading-[150%] text-gray-700 transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                    >
                      <Download className="size-5 shrink-0" />
                      Download
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        ) : tab === 'papers' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPastPaperCards.map((card, i) => (
              <article className="flex flex-col justify-between overflow-hidden gap-5 rounded-2xl bg-white py-6 ring-1 ring-[rgba(8,22,39,0.06)]">
                <div className="flex w-full min-w-0 flex-col gap-5">
                  <div className="flex flex-wrap gap-2 text-sm leading-[150%] px-6 lg:text-base lg:leading-[150%]">
                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm md:text-base font-medium leading-[150%] lg:text-base lg:leading-[150%] ${card.subject.bg} ${card.subject.border} ${card.subject.text}`}
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${card.subject.dot}`}
                      />
                      {card.subject.label}
                    </div>
                    <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 font-medium leading-[150%] text-lightgray/50 text-sm lg:text-base lg:leading-[150%]">
                      {card.board}
                    </div>
                  </div>
                  {tab === 'papers' ? (
                    <div
                      className={`flex items-center justify-center ${card.subject.bg} h-[62px]`}
                    >
                      <span className="text-xl font-medium text-center">
                        2025
                      </span>
                    </div>
                  ) : (
                    <div className="flex w-full min-w-0 flex-col gap-3 px-6">
                      <h2 className="line-clamp-1 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
                        {card.title}
                      </h2>

                      <div className="flex min-w-0 items-center gap-2 text-sm leading-[150%] lg:text-base lg:leading-[150%]">
                        <span className="min-w-0 truncate font-medium leading-[150%] text-lightgray/80">
                          {card.metaLeft!}
                        </span>
                        {/* <span className={card.metaSepDotClass} aria-hidden /> */}
                        <span className="min-w-0 truncate font-medium leading-[150%] text-lightgray/80">
                          {card.metaRight!}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex w-full gap-3 px-6">
                  <button
                    type="button"
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium leading-[150%] text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                  >
                    <Eye className="size-5 shrink-0" />
                    View
                  </button>
                  <button
                    type="button"
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[#0816271A] bg-white text-sm font-medium leading-[150%] text-gray-700 transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                  >
                    <Download className="size-5 shrink-0" />
                    Download
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : tab === 'quizzes' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredQuizCards.map((card) => (
              <QuizListingCard key={card.slug} card={card} />
            ))}
          </div>
        ) : tab === 'videos' ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFreeVideos.map((card, i) => (
              <FreeVideoListingCard
                key={`${card.title}-${i}`}
                subject={card.subject}
                board={card.board}
                chapter={card.chapter}
                title={card.title}
                durationLabel={card.durationLabel}
                thumbSrc={freeVideoThumbSrc(card)}
                youtubeId={card.youtubeId}
                onWatch={
                  card.youtubeId
                    ? () =>
                        setVideoPlayer({
                          youtubeId: card.youtubeId!,
                          title: card.title,
                        })
                    : undefined
                }
                downloadUrl={card.downloadUrl}
                downloadFilename={card.downloadFilename}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card, i) => (
              <FigmaListingCard
                tab={tab}
                key={`${card.title}-${card.subject.label}-${i}`}
                subject={card.subject}
                board={card.board}
                chapter={card.chapter}
                title={card.title}
                metaLine={card.meta}
                footer={
                  <div className="flex w-full gap-3 px-6">
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] text-sm font-medium leading-[150%] text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                    >
                      <Download className="size-5 shrink-0" />
                      Question Paper
                    </button>
                    <button
                      type="button"
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[#0816271A] text-sm font-medium leading-[150%] text-gray-700 transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
                    >
                      <Download className="size-5 shrink-0" />
                      Answers Sheet
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      {videoPlayer && (
        <FreeVideoPlayerModal
          youtubeId={videoPlayer.youtubeId}
          title={videoPlayer.title}
          onClose={() => setVideoPlayer(null)}
        />
      )}

      {expandedFormula && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-[rgba(8,22,39,0.4)] px-3 py-4 sm:px-4 sm:py-6"
          onClick={() => setExpandedFormula(null)}
        >
          <div
            className="w-full max-w-[824px] max-h-[calc(100vh-32px)] overflow-auto rounded-2xl bg-white p-4 sm:p-6 shadow-[0_4px_8px_rgba(0,0,0,0.03),0_15px_15px_rgba(0,0,0,0.02),0_33px_20px_rgba(0,0,0,0.01),0_59px_24px_rgba(0,0,0,0),0_92px_26px_rgba(0,0,0,0)] scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex flex-wrap gap-2 text-sm leading-[150%]">
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium leading-[150%] ${expandedFormula.subject.bg} ${expandedFormula.subject.border} ${expandedFormula.subject.text}`}
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${expandedFormula.subject.dot}`}
                  />
                  {expandedFormula.subject.label}
                </div>
                <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 font-medium leading-[150%] text-lightgray/50 text-sm">
                  {expandedFormula.board}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close formula details"
                onClick={() => setExpandedFormula(null)}
                className="flex size-7 items-center justify-center rounded-full border border-[rgba(8,22,39,0.05)] bg-[rgba(8,22,39,0.1)] text-lightgray/40 hover:bg-lightgray/12"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <g opacity="0.5">
                    <path
                      d="M12.854 12.1465C12.9005 12.193 12.9373 12.2481 12.9625 12.3088C12.9876 12.3695 13.0006 12.4346 13.0006 12.5003C13.0006 12.566 12.9876 12.631 12.9625 12.6917C12.9373 12.7524 12.9005 12.8076 12.854 12.854C12.8076 12.9005 12.7524 12.9373 12.6917 12.9625C12.631 12.9876 12.566 13.0006 12.5003 13.0006C12.4346 13.0006 12.3695 12.9876 12.3088 12.9625C12.2481 12.9373 12.193 12.9005 12.1465 12.854L8.00028 8.70715L3.85403 12.854C3.76021 12.9478 3.63296 13.0006 3.50028 13.0006C3.3676 13.0006 3.24035 12.9478 3.14653 12.854C3.05271 12.7602 3 12.633 3 12.5003C3 12.3676 3.05271 12.2403 3.14653 12.1465L7.2934 8.00028L3.14653 3.85403C3.05271 3.76021 3 3.63296 3 3.50028C3 3.3676 3.05271 3.24035 3.14653 3.14653C3.24035 3.05271 3.3676 3 3.50028 3C3.63296 3 3.76021 3.05271 3.85403 3.14653L8.00028 7.2934L12.1465 3.14653C12.2403 3.05271 12.3676 3 12.5003 3C12.633 3 12.7602 3.05271 12.854 3.14653C12.9478 3.24035 13.0006 3.3676 13.0006 3.50028C13.0006 3.63296 12.9478 3.76021 12.854 3.85403L8.70715 8.00028L12.854 12.1465Z"
                      fill="#081627"
                    />
                  </g>
                </svg>
              </button>
            </div>
            <h3 className="text-xl font-semibold leading-[150%] tracking-[-0.24px] text-lightgray sm:text-2xl sm:leading-[150%]">
              {expandedFormula.title}
            </h3>
            <div
              className={`mt-3 rounded-2xl py-2 ${expandedFormula.gradient} h-[240px] sm:h-[360px] lg:h-[441px]`}
            >
              <div className="grid h-full w-full grid-cols-[32px_1fr_32px] sm:grid-cols-[90px_1fr_90px] gap-2 sm:gap-3">
                <div className="rounded-r-2xl bg-white/10 blur-[2px]" />
                <div className="rounded-2xl bg-white/40 p-3 sm:p-4 overflow-y-auto scrollbar-hide">
                  <p className="whitespace-pre-line text-sm font-medium leading-[150%] text-white/85 sm:text-xl sm:leading-[150%] lg:text-2xl lg:leading-[150%]">
                    {expandedFormula.detail || expandedFormula.formula}
                  </p>
                </div>
                <div className="rounded-l-2xl bg-white/10 blur-[2px]" />
              </div>
            </div>
            <p className="mt-4 border-b border-[rgba(8,22,39,0.1)] pb-6 text-base font-normal leading-[150%] text-lightgray/90 sm:text-lg sm:leading-[150%]">
              Test your knowledge with code challenges based on real-world
              technical interviews from companies like Google, Amazon, and Meta.
              Practice for your job search — or for fun. Don’t worry if you get
              stuck. We’ll recommend the right courses to help you.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <h4 className="text-lg font-semibold leading-[150%] tracking-[-0.24px] text-lightgray sm:text-2xl sm:leading-[150%]">
                Related Formulas
              </h4>
              <div className="flex items-center gap-2 text-lightgray/40">
                <button
                  type="button"
                  aria-label="Previous related formulas"
                  onClick={() => scrollRelated('prev')}
                  className="flex size-9 items-center justify-center rounded-full bg-lightgray/3 border border-lightgray/6 hover:bg-lightgray/6"
                >
                  <CarouselArrow dir="left" className="text-lightgray" />
                </button>
                <button
                  type="button"
                  aria-label="Next related formulas"
                  onClick={() => scrollRelated('next')}
                  className="flex size-9 items-center justify-center rounded-full bg-lightgray/3 border border-lightgray/6 hover:bg-lightgray/6"
                >
                  <CarouselArrow dir="right" className="text-lightgray" />
                </button>
              </div>
            </div>
            <div
              ref={relatedCarouselRef}
              className="mt-5 scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
            >
              {FORMULA_CARDS.map((related) => (
                <article
                  key={`related-${related.title}`}
                  data-related-card
                  className="snap-start w-[min(100%,420px)] sm:w-[426.6666564941406px] shrink-0 rounded-[20px] border border-[rgba(8,22,39,0.1)] p-6 shadow-xs"
                >
                  <div className="flex flex-wrap gap-2 text-sm leading-[150%] lg:text-base lg:leading-[150%]">
                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium leading-[150%] lg:text-base lg:leading-[150%] ${related.subject.bg} ${related.subject.border} ${related.subject.text}`}
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${related.subject.dot}`}
                      />
                      {related.subject.label}
                    </div>
                    <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 font-medium leading-[150%] text-lightgray/50 text-sm lg:text-base lg:leading-[150%]">
                      {related.board}
                    </div>
                  </div>
                  <p className="mt-3 text-xl font-semibold leading-[150%] text-lightgray">
                    {related.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpandedFormula(related)}
                    className="mt-5 flex w-full items-center justify-center gap-1 rounded-full border border-[rgba(58,107,252,0.1)] py-1 text-sm font-medium leading-[150%] text-[#3a6bfc] hover:bg-[rgba(58,107,252,0.06)]"
                  >
                    View <span className="text-base leading-[150%]">›</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
