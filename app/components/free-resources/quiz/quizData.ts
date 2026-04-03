/** Figma: 1:5404 listing, 1:5989 intro, 1:5813 play, 1:5896 result */

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type SubjectPill = {
  label: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
};

export type QuizListCard = {
  slug: string;
  subject: SubjectPill;
  board: string;
  title: string;
  metaLine: string;
  difficulty: QuizDifficulty;
  /** e.g. "24/30" — shows attempted ribbon + View Result / Re-take */
  attempted?: string;
};

export type QuizBreakdownItem = {
  question: string;
  correct: boolean;
  yourAnswer: string;
  correctAnswer: string;
};

export type QuizSession = {
  slug: string;
  introTag: string;
  title: string;
  subtitle: string;
  /** Four columns: label + value each */
  stats: Array<{ label: string; value: string; valueClass?: string }>;
  instructions: string[];
  questions: Array<{ text: string; options: string[] }>;
  result?: {
    scorePercent: string;
    scoreSummaryBefore: string;
    scoreSummaryBold: string;
    scoreSummaryAfter: string;
    totalQs: number;
    correct: number;
    wrong: number;
    skipped: number;
    breakdown: QuizBreakdownItem[];
    subject: SubjectPill;
    board: string;
    difficulty: QuizDifficulty;
    quizTitle: string;
  };
};

export const difficultyTextClass: Record<QuizDifficulty, string> = {
  easy: 'font-mono text-base font-medium uppercase tracking-[0.64px] text-[#12caa5]',
  medium:
    'font-mono text-base font-medium uppercase tracking-[0.64px] text-[#ca9312]',
  hard: 'font-mono text-base font-medium uppercase tracking-[0.64px] text-[#ea502a]',
};

const ACC: SubjectPill = {
  label: 'Accountancy',
  dot: 'bg-[#1764d4]',
  bg: 'bg-[rgba(23,100,212,0.05)]',
  border: 'border-[rgba(23,100,212,0.1)]',
  text: 'text-[#1764d4]',
};

const ENG: SubjectPill = {
  label: 'English',
  dot: 'bg-[#6b7c5e]',
  bg: 'bg-[rgba(107,124,94,0.05)]',
  border: 'border-[rgba(107,124,94,0.1)]',
  text: 'text-[#6b7c5e]',
};

const BS: SubjectPill = {
  label: 'Business Studies',
  dot: 'bg-[#ba7517]',
  bg: 'bg-[rgba(186,117,23,0.05)]',
  border: 'border-[rgba(186,117,23,0.1)]',
  text: 'text-[#ba7517]',
};

const ECO: SubjectPill = {
  label: 'Economics',
  dot: 'bg-[#0baf7e]',
  bg: 'bg-[rgba(11,175,126,0.05)]',
  border: 'border-[rgba(11,175,126,0.1)]',
  text: 'text-[#0baf7e]',
};

const OCM: SubjectPill = {
  label: 'OCM',
  dot: 'bg-[#7b36ec]',
  bg: 'bg-[rgba(123,54,236,0.05)]',
  border: 'border-[rgba(123,54,236,0.1)]',
  text: 'text-[#7b36ec]',
};

const MATHS: SubjectPill = {
  label: 'Maths',
  dot: 'bg-[#4a6fa5]',
  bg: 'bg-[rgba(74,111,165,0.05)]',
  border: 'border-[rgba(74,111,165,0.1)]',
  text: 'text-[#4a6fa5]',
};

const SPM: SubjectPill = {
  label: 'SP & Marketing',
  dot: 'bg-[#e04848]',
  bg: 'bg-[rgba(224,72,72,0.05)]',
  border: 'border-[rgba(224,72,72,0.1)]',
  text: 'text-[#e04848]',
};

export const QUIZ_LIST: QuizListCard[] = [
  {
    slug: 'ratio-analysis-chapter-quiz',
    subject: ACC,
    board: 'CBSE',
    title: 'Ratio Analysis — Chapter Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'hard',
    attempted: '24/30',
  },
  {
    slug: 'cash-flow-statement-quiz',
    subject: ENG,
    board: 'MH Board',
    title: 'Cash Flow Statement Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'easy',
  },
  {
    slug: 'national-income-concepts-quiz',
    subject: ENG,
    board: 'MH Board',
    title: 'National Income — Concepts Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'medium',
  },
  {
    slug: 'money-banking-quiz',
    subject: BS,
    board: 'CBSE',
    title: 'Money & Banking Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'medium',
  },
  {
    slug: 'financial-management-mcqs',
    subject: ECO,
    board: 'CBSE',
    title: 'Financial Management MCQs',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'medium',
  },
  {
    slug: 'partnership-accounts-quiz',
    subject: OCM,
    board: 'CBSE',
    title: 'Partnership Accounts Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'medium',
  },
  {
    slug: 'govt-budget-quick-quiz',
    subject: ENG,
    board: 'CBSE',
    title: 'Govt Budget — Quick Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'hard',
  },
  {
    slug: 'marketing-management-quiz',
    subject: MATHS,
    board: 'CBSE',
    title: 'Marketing Management Quiz',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'hard',
  },
  {
    slug: 'company-accounts-issue-of-shares',
    subject: SPM,
    board: 'CBSE',
    title: 'Company Accounts — Issue of Shares',
    metaLine: '32 Questions • 80 Marks • 180 Minutes',
    difficulty: 'hard',
  },
];

const SESSIONS: Record<string, QuizSession> = {
  'bad-debt-quiz': {
    slug: 'bad-debt-quiz',
    introTag: 'Accounting',
    title: 'Bad Debt Quiz',
    subtitle:
      'Using this knowledge, you’ll evaluate how AI and Gen AI developments may impact your work and discuss where the future might lead.',
    stats: [
      {
        label: 'Level',
        value: '(Easy)',
        valueClass:
          'font-mono text-2xl font-medium leading-[120%] text-[#12caa5] tracking-[0.96px]',
      },
      { label: 'Marks', value: '12' },
      { label: 'Questions', value: '30' },
      { label: 'Minutes', value: '180' },
    ],
    instructions: [
      'You’ll examine key moments in AI history, including the emergence of Gen AI, explore its benefits and considerations, as well as investigate the ethics of responsible AI.',
      'Using this knowledge, you’ll evaluate how AI and Gen AI developments may impact your work and discuss where the future might lead.',
      'Throughout the course, you’ll enhance your understanding of AI, and Gen AI in the workplace, before looking at the impact on an individual level through case studies and self-reflective tasks.',
    ],
    questions: [
      {
        text: 'Financial leverage involves the use of:',
        options: [
          'A. Equity only',
          'B. Debt to amplify returns',
          'C. Cash reserves',
          'D. Inventory',
        ],
      },
    ],
  },
  'ratio-analysis-chapter-quiz': {
    slug: 'ratio-analysis-chapter-quiz',
    introTag: 'Accountancy',
    title: 'Ratio Analysis — Chapter Quiz',
    subtitle:
      'Practice ratio formulas and interpretations. Review results to see what you got right.',
    stats: [
      {
        label: 'Level',
        value: '(HARD)',
        valueClass:
          'font-mono text-2xl font-medium text-[#ea502a] tracking-wide',
      },
      { label: 'Marks', value: '30' },
      { label: 'Questions', value: '15' },
      { label: 'Minutes', value: '45' },
    ],
    instructions: [
      'Answer all questions within the time limit. You can navigate between questions using the number strip.',
      'Each question carries equal marks unless stated otherwise.',
    ],
    questions: [
      {
        text: 'What is the formula for Gross Profit Ratio?',
        options: [
          'A. Net Profit / Sales × 100',
          'B. GP / Net Sales × 100',
          'C. Operating Profit / Sales × 100',
          'D. Gross Profit / Cost of Sales × 100',
        ],
      },
    ],
    result: {
      scorePercent: '80.0%',
      scoreSummaryBefore: 'You scored ',
      scoreSummaryBold: '24 out of 30 marks',
      scoreSummaryAfter: '. Great attempt — review the 3 wrong answers below.',
      totalQs: 15,
      correct: 12,
      wrong: 3,
      skipped: 0,
      subject: ACC,
      board: 'CBSE',
      difficulty: 'hard',
      quizTitle: 'Ratio Analysis - Chapter Quiz',
      breakdown: [
        {
          question: '1. What is the formula for Gross Profit Ratio?',
          correct: true,
          yourAnswer: 'GP / Net Sales × 100 ✓',
          correctAnswer: 'GP / Net Sales × 100',
        },
        {
          question: '2. What does EBITDA stand for?',
          correct: true,
          yourAnswer:
            'Earnings Before Interest, Taxes, Depreciation, and Amortization ✓',
          correctAnswer:
            'Earnings Before Interest, Taxes, Depreciation, and Amortization',
        },
        {
          question: '2. What does EBITDA stand for?',
          correct: false,
          yourAnswer:
            'Earnings Before Interest, Taxes, Depreciation, and Amortization ✓',
          correctAnswer:
            'Earnings Before Interest, Taxes, Depreciation, and Amortization',
        },
      ],
    },
  },
};

const DEFAULT_SESSION: QuizSession = {
  slug: 'sample',
  introTag: 'General',
  title: 'Chapter Quiz',
  subtitle: 'Test your understanding with timed multiple-choice questions.',
  stats: [
    {
      label: 'Level',
      value: '(Medium)',
      valueClass: 'font-mono text-2xl font-medium text-[#ca9312] tracking-wide',
    },
    { label: 'Marks', value: '80' },
    { label: 'Questions', value: '32' },
    { label: 'Minutes', value: '180' },
  ],
  instructions: [
    'Read each question carefully before selecting an answer.',
    'You can move between questions using Previous and Next.',
  ],
  questions: [
    {
      text: 'Financial leverage involves the use of:',
      options: [
        'A. Equity only',
        'B. Debt to amplify returns',
        'C. Cash reserves',
        'D. Inventory',
      ],
    },
  ],
};

function difficultyToLevel(d: QuizDifficulty): {
  value: string;
  valueClass: string;
} {
  const map = {
    easy: {
      value: '(Easy)',
      valueClass:
        'font-mono text-[15px] leading-[120%] sm:text-xl md:text-2xl font-medium text-[#12caa5] tracking-wide',
    },
    medium: {
      value: '(Medium)',
      valueClass:
        'font-mono text-[15px] leading-[120%] sm:text-xl md:text-2xl font-medium text-[#ca9312] tracking-wide',
    },
    hard: {
      value: '(HARD)',
      valueClass:
        'font-mono text-[15px] leading-[120%] sm:text-xl md:text-2xl font-medium text-[#ea502a] tracking-wide',
    },
  } as const;
  return map[d];
}

export function getQuizSession(slug: string): QuizSession {
  const custom = SESSIONS[slug];
  if (custom) return custom;
  const card = getQuizListCard(slug);
  const level = card
    ? difficultyToLevel(card.difficulty)
    : difficultyToLevel('medium');
  return {
    ...DEFAULT_SESSION,
    slug,
    title: card?.title ?? DEFAULT_SESSION.title,
    introTag: card?.subject.label ?? DEFAULT_SESSION.introTag,
    stats: [
      { label: 'Level', value: level.value, valueClass: level.valueClass },
      { label: 'Marks', value: '80' },
      { label: 'Questions', value: '32' },
      { label: 'Minutes', value: '180' },
    ],
  };
}

export function getQuizListCard(slug: string): QuizListCard | undefined {
  return QUIZ_LIST.find((q) => q.slug === slug);
}

export function isValidQuizSlug(slug: string): boolean {
  if (QUIZ_LIST.some((q) => q.slug === slug)) return true;
  return Object.prototype.hasOwnProperty.call(SESSIONS, slug);
}
