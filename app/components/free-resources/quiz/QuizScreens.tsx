import { Link } from '@remix-run/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { difficultyTextClass, type QuizSession } from './quizData';

const LOGO_SRC = '/assets/logo.png';

/** Figma 1:5989 intro/play — pill bar: logo, track, close. Figma 1:5896 result — logo only. */
export function QuizTopBar({
  progress,
  hideProgress = false,
  closeTo = '/free-resources',
  variant = 'default',
}: {
  progress: number;
  closeTo?: string;
  hideProgress?: boolean;
  variant?: 'default' | 'result';
}) {
  const pct = Math.min(100, Math.max(0, progress * 100));

  if (variant === 'result') {
    return (
      <div className="left-0 right-0 top-0 z-50 flex justify-center px-4 pt-6 sm:pt-12">
        <div className="flex w-full max-w-[1320px] 4xl:max-w-[1368px]! items-center justify-center rounded-[300px] border border-[rgba(8,22,39,0.1)] bg-[rgba(255,255,255,0.5)] px-6 py-4 backdrop-blur-[25px]">
          <img
            src={LOGO_SRC}
            alt="Commerce Virtuals"
            className="h-8 w-auto"
            width={163}
            height={32}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="left-0 right-0 top-0 z-50 flex justify-center px-3 pt-10 4xl:pt-12!">
      <div className="flex w-full max-w-[1320px] 4xl:max-w-[1368px]! items-center justify-between gap-10 rounded-[300px] border border-[rgba(8,22,39,0.1)] bg-[rgba(255,255,255,0.5)] px-6 py-4 backdrop-blur-[25px] sm:gap-12">
        <img
          src={LOGO_SRC}
          alt="Commerce Virtuals"
          className="h-8 w-auto shrink-0"
          width={163}
          height={32}
        />
        {!hideProgress && (
          <div
            className="h-4 min-w-0 flex-1 overflow-hidden rounded-[30px] bg-[rgba(8,22,39,0.05)]"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-[30px] bg-[#3b6cfc] transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        <Link
          to={closeTo}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(8,22,39,0.08)] bg-white/80 text-lightgray/55 transition-colors hover:bg-white hover:text-lightgray"
          aria-label="Close quiz"
        >
          <X className="size-[18px]" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

/** Intro: mobile 2×2 grid + vertical/horizontal rules; md+ single row of four columns */
function IntroStatStrip({ stats }: { stats: QuizSession['stats'] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-lightgray/10 bg-white/50 p-4 sm:rounded-[20px] sm:p-6 backdrop-blur-xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5">
        {stats.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className={`flex min-h-0 min-w-0 flex-col gap-2 sm:gap-4 ${
              i % 2 === 1
                ? 'border-l border-[rgba(8,22,39,0.1)] pl-4'
                : 'pr-2 sm:pr-0'
            } ${i >= 2 ? 'sm:border-t-0' : ''} ${
              i > 0 ? 'sm:border-l sm:border-[rgba(8,22,39,0.1)] sm:pl-6' : ''
            }`}
          >
            <span className="text-[11px] font-semibold uppercase leading-normal tracking-[0.08em] text-lightgray/50 sm:text-xs sm:tracking-[1px]">
              {s.label}
            </span>
            <span
              className={
                s.valueClass ??
                'text-xl font-semibold leading-[120%] tracking-[-0.24px] text-lightgray sm:text-2xl'
              }
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Result stats: mobile 2×2 grid; md+ four columns, frosted strip */
function ResultStatStrip({
  totalQs,
  correct,
  wrong,
  skipped,
}: {
  totalQs: number;
  correct: number;
  wrong: number;
  skipped: number;
}) {
  const cols = [
    { label: 'Total Qs', value: String(totalQs), valueClass: '' },
    {
      label: 'Correct',
      value: String(correct),
      valueClass:
        'font-mono text-xl font-medium leading-[120%] tracking-[0.96px] text-[#12caa5] md:text-2xl',
    },
    {
      label: 'Wrong',
      value: String(wrong),
      valueClass:
        'text-xl font-semibold leading-[120%] tracking-[-0.24px] text-[#ea502a] md:text-2xl',
    },
    {
      label: 'Skipped',
      value: String(skipped),
      valueClass:
        'text-xl font-semibold leading-[120%] tracking-[-0.24px] text-lightgray md:text-2xl',
    },
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl md:border border-[rgba(8,22,39,0.08)] p-4 md:rounded-[20px] md:border-[rgba(8,22,39,0.1)] md:bg-[rgba(255,255,255,0.5)] md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cols.map((c, i) => (
          <div
            key={c.label}
            className={`flex min-h-0  md:bg-transparent min-w-0 flex-col gap-1 text-lightgray md:gap-4 ${
              i % 2 === 1
                ? 'md:border-l border-[rgba(8,22,39,0.1)] pl-2 md:pl-4'
                : 'pr-2 md:pr-0'
            } ${
              i >= 2
                ? 'md:border-t border-[rgba(8,22,39,0.1)] pt-3 md:border-t-0 md:pt-0'
                : ''
            } ${
              i > 0 ? 'md:border-l md:border-[rgba(8,22,39,0.1)] md:pl-6' : ''
            }`}
          >
            <div className="bg-[rgba(255,255,255,0.5)] flex flex-col items-start rounded-2xl py-3 md:py-0  md:px-0 px-4 gap-2 md:gap-0 ">
              <span className="text-[11px] font-semibold uppercase leading-normal tracking-[0.08em] text-lightgray/50 md:text-sm md:tracking-[1px] md:opacity-100">
                {c.label}
              </span>
              <span
                className={
                  c.valueClass ||
                  'text-xl font-semibold leading-[120%] tracking-[-0.24px] md:text-2xl'
                }
              >
                {c.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizIntroScreen({ session }: { session: QuizSession }) {
  console.log('QuizIntroScreen session:', session);
  // bg-[#F5F7FF]
  return (
    <div className="relative ">
      <header className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md md:hidden pt-7">
        <div className="flex h-14 items-center px-2">
          <Link
            to="/free-resources"
            className="flex size-11 items-center justify-center rounded-full text-lightgray/50 transition-colors hover:bg-[rgba(8,22,39,0.05)]"
            aria-label="Back to resources"
          >
            <ArrowLeft className="size-6" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div className="hidden md:block">
        <QuizTopBar progress={0.04} hideProgress />
      </div>

      <div className="custom-container flex-1 px-4  sm:px-6 pt-24">
        <div className="mx-auto flex w-full max-w-[877px] flex-col gap-6 sm:gap-8 4xl:gap-12!">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="hidden flex-wrap items-center gap-2 md:flex">
              <div
                className={`flex items-center gap-2 rounded-[40px] border px-3 py-1 text-base font-medium leading-[120%] ${session.subject.bg} ${session.subject.border} ${session.subject.text}`}
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${session.subject.dot}`}
                />
                {session.subject.label}
              </div>
              <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 text-base font-medium leading-[120%] text-lightgray/50">
                {session.board}
              </div>
              <span className={difficultyTextClass[session.difficulty]}>
                {session.difficulty === 'easy'
                  ? '(Easy)'
                  : session.difficulty === 'medium'
                  ? '(Medium)'
                  : '(HARD)'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold leading-[120%] tracking-[-0.56px] text-lightgray lg:text-4xl sm:font-semibold sm:tracking-[-0.72px]">
              {session.title}
            </h1>
            <p className="text-base font-normal leading-[150%] text-lightgray sm:text-lg sm:text-lightgray md:text-xl">
              {session.subtitle}
            </p>
          </div>

          <IntroStatStrip stats={session.stats} />

          <div className="flex flex-col gap-3 text-lightgray sm:gap-4 4xl:gap-6! mt-3 sm:mt-0">
            <h2 className="text-[15px] sm:text-lg font-semibold leading-[120%] tracking-[-0.2px] md:text-2xl md:font-medium md:tracking-[-0.24px]">
              Instructions
            </h2>
            <div className="flex flex-col gap-2 md:gap-3 4xl:gap-5! md:text-xl md:font-normal md:leading-[150%]">
              {session.instructions.map((line, i) => (
                <p
                  key={i}
                  className="text-[15px] font-normal leading-[155%] text-lightgray/55 md:text-xl md:leading-[150%] md:text-lightgray/50"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <Link
            to={`/free-resources/quizzes/${session.slug}/play`}
            className="primary-btn hidden w-fit items-center justify-center gap-3 rounded-[38px] px-6 py-4 text-xl font-medium leading-[120%] md:inline-flex"
          >
            Start Quiz
            <ArrowRight
              className="size-8 shrink-0 text-white"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>
      </div>
      {/* mobile button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 backdrop-blur-md md:hidden">
        <Link
          to={`/free-resources/quizzes/${session.slug}/play`}
          className="primary-btn flex w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold py-3 leading-[120%]"
        >
          Start Quiz
          <ArrowRight
            className="size-5 shrink-0 text-white"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
}

function QuizPlayQuestionNav({
  navCount,
  total,
  idx,
  onSelectQuestion,
  variant = 'mobile',
}: {
  navCount: number;
  total: number;
  idx: number;
  onSelectQuestion: (index: number) => void;
  variant?: 'mobile';
}) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3 pb-1">
      {Array.from({ length: navCount }, (_, i) => {
        const n = i + 1;
        const active = i === idx;
        const disabled = i >= total;
        const completed = i < idx && !disabled;

        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) onSelectQuestion(i);
            }}
            className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors ${
              disabled
                ? 'cursor-not-allowed bg-[rgba(8,22,39,0.05)] text-lightgray/25'
                : completed
                ? 'border-2 border-[#12caa5] bg-[rgba(18,202,165,0.14)] text-[#0a9b7a]'
                : active
                ? 'border-2 border-lightgray bg-white text-lightgray shadow-sm'
                : 'bg-[rgba(8,22,39,0.08)] text-lightgray/65'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// Mock session for testing with 10 questions
// const MOCK_SESSION: QuizSession = {
//   slug: 'test-quiz',
//   introTag: 'General Knowledge',
//   title: 'Test Quiz',
//   subtitle: 'Take this quiz to test your general knowledge',
//   subject: {
//     label: 'General Knowledge',
//     dot: 'bg-[#0baf7e]',
//     bg: 'bg-[rgba(11,175,126,0.05)]',
//     border: 'border-[rgba(11,175,126,0.1)]',
//     text: 'text-[#0baf7e]',
//   },
//   board: 'All Boards',
//   difficulty: 'medium',
//   stats: [
//     { label: 'Total Questions', value: '10' },
//     { label: 'Difficulty', value: 'Medium' },
//     { label: 'Average Time', value: '5m' },
//     { label: 'Category', value: 'General Knowledge' },
//   ],
//   instructions: [
//     'Read each question carefully',
//     'Select one answer per question',
//     'You can skip questions and come back to them',
//     'Review your answers before submitting',
//   ],
//   questions: [
//     { text: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'] },
//     { text: 'Which planet is closest to the sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'] },
//     { text: 'What is 2 + 2?', options: ['3', '4', '5', '6'] },
//     { text: 'Who wrote Romeo and Juliet?', options: ['Jane Austen', 'William Shakespeare', 'Mark Twain', 'Charles Dickens'] },
//     { text: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'] },
//     { text: 'What is the chemical symbol for gold?', options: ['Gd', 'Go', 'Au', 'Ag'] },
//     { text: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'] },
//     { text: 'What is the smallest prime number?', options: ['0', '1', '2', '3'] },
//     { text: 'Which country has the most population?', options: ['India', 'China', 'USA', 'Indonesia'] },
//     { text: 'What is the hardest natural substance?', options: ['Gold', 'Silver', 'Diamond', 'Platinum'] },
//   ],
// };

export function QuizPlayScreen({ session }: { session: QuizSession }) {
  const total = session.questions.length;
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const q = session.questions[idx];
  const navCount = total;

  const answeredCount = answeredQuestions.size + skippedQuestions.size;
  const progress = 0.12 + (answeredCount / Math.max(total, 1)) * 0.88;

  // Timer state (counting up from 0)
  const [elapsed, setElapsed] = useState(0);

  // Timer increment effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load saved answer when question index changes
  useEffect(() => {
    setSelected(answers[idx] ?? null);
  }, [idx, answers]);

  if (!q) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] pt-32 text-center text-lightgray">
        No questions loaded.
      </div>
    );
  }

  const finishLink =
    session.result != null
      ? `/free-resources/quizzes/${session.slug}/result`
      : `/free-resources/quizzes/${session.slug}/start`;

  const goToQuestion = (i: number) => {
    setIdx(i);
    setSelected(null);
  };

  const unansweredCount = Math.max(total - answeredCount, 0);

  const handleSelectAnswer = (optionIndex: number) => {
    setSelected(optionIndex);
    setAnswers((prev) => ({
      ...prev,
      [idx]: optionIndex,
    }));
  };

  const handleSkipQuestion = () => {
    setSkippedQuestions((prev) => new Set([...prev, idx]));
    setSelected(null);
    if (idx < total - 1) {
      setIdx(idx + 1);
    }
  };

  const handleNextQuestion = () => {
    // Mark as answered when moving to next question if an answer was selected
    if (selected !== null) {
      setAnsweredQuestions((prev) => new Set([...prev, idx]));
    }
    setIdx((i) => Math.min(total - 1, i + 1));
    setSelected(null);
  };

  const handlePreviousQuestion = () => {
    setIdx((i) => Math.max(0, i - 1));
    setSelected(null);
  };

  return (
    <div className="relative bg-[#F5F7FF]">
      {/* mobile question idnex */}

      <header className="fixed left-0 right-0 top-0 z-50 bg-white md:hidden pt-10">
        <div className="md:hidden flex items-center justify-between px-6 mb-4">
          <div>
            <Link
              to={'/free-resources'}
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-lightgray/20 text-white transition-colors hover:bg-white hover:text-lightgray"
              aria-label="Close quiz"
            >
              <X className="size-[18px]" strokeWidth={2} />
            </Link>
          </div>
          <span className=" rounded-full text-xl font-medium bg-lightgray/5 px-4 py-1">
            {idx + 1}
            <span className="text-lightgray/50 text-lg">/{total}</span>
          </span>
          <span className="w-10 text-xl font-semibold tabular-nums text-lightgray">
            {formatTime(elapsed)}
          </span>
        </div>
      </header>

      <div className="hidden md:block">
        <QuizTopBar progress={progress} />
      </div>
      {/* content */}
      <div className="w-full max-w-[1320px] mx-auto flex-1 pt-25 md:pt-10 md:pb-30 pb-48">
        <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col md:flex-none">
          <div className="mb-4 sm:mb-6 w-full gap-5 flex md:mb-10 flex-col">
            {/* question index */}
            <div className="flex items-center justify-center md:justify-between gap-4">
              <p className="text-xl font-medium leading-[120%] text-lightgray">
                <span className="hidden md:inline">
                  Question {idx + 1} out of {total}
                </span>
              </p>
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={handlePreviousQuestion}
                  className="flex size-9 items-center justify-center rounded-full bg-[rgba(8,22,39,0.03)] text-lightgray/55 transition-colors enabled:hover:bg-[rgba(8,22,39,0.08)] disabled:bg-[rgba(8,22,39,0.08)] disabled:text-lightgray/25 disabled:cursor-not-allowed"
                  aria-label="Previous question"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  disabled={idx >= total - 1 || selected === null}
                  onClick={handleNextQuestion}
                  className="flex size-9 items-center justify-center rounded-full bg-[rgba(8,22,39,0.03)] text-lightgray/55 transition-colors enabled:hover:bg-[rgba(8,22,39,0.08)] disabled:opacity-40"
                  aria-label="Next question"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* step indicator */}
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1 px-6 md:px-0">
              {Array.from({ length: navCount }, (_, i) => {
                const n = i + 1;
                const isAnswered = answeredQuestions.has(i);
                const isSkipped = skippedQuestions.has(i);
                const isAnsweredOrSkipped = isAnswered || isSkipped;
                const disabled =
                  i >= total || (i > idx && !isAnsweredOrSkipped);
                return (
                  <button
                    key={`desktop-q-${n}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) goToQuestion(i);
                    }}
                    className={`flex size-[42px] shrink-0 items-center justify-center rounded-[38px] border text-xl font-medium leading-[120%] transition-colors ${
                      disabled
                        ? 'cursor-not-allowed border-[rgba(8,22,39,0.03)] bg-[rgba(8,22,39,0.03)] text-lightgray/50'
                        : isAnsweredOrSkipped
                        ? 'border-[#0d8769] bg-[rgba(13,135,105,0.1)] text-[#0d8769]'
                        : 'border-lightgray bg-[rgba(8,22,39,0.05)] text-lightgray hover:bg-[rgba(8,22,39,0.08)]'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {/* answer summary */}
            <div className="hidden md:flex items-center gap-2 text-sm leading-[120%]">
              <p className="border-r border-[rgba(8,22,39,0.1)] pr-2 text-lightgray/50">
                Answered:{' '}
                <span className="font-medium text-lightgray">
                  {answeredCount}
                </span>
              </p>
              <p className="text-lightgray/50">
                Unanswered:{' '}
                <span className="font-medium text-lightgray">
                  {unansweredCount}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-white md:bg-transparent">
            <div className="flex flex-1 flex-col gap-6 md:p-0 sm:gap-8 p-5">
              <p className="font-medium text-lightgray text-lg sm:font-medium sm:text-lightgray lg:text-2xl leading-[120%]">
                {q.text}
              </p>
              <div className="flex flex-col gap-2 sm:gap-3">
                {q.options.map((opt, oi) => {
                  const isSel = selected === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => handleSelectAnswer(oi)}
                      className={`flex w-full items-center border-2 px-4 sm:px-6 py-3 sm:py-4 text-left text-base transition-colors sm:text-lg rounded-full bg-white! font-medium leading-[120%] ${
                        isSel
                          ? ' border-[#3A6BFC] font-medium text-[#3A6BFC]'
                          : ' border-lightgray/5 bg-white! text-lightgray hover:border-[rgba(8,22,39,0.2)] md:hover:border-[rgba(8,22,39,0.18)]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={selected === null}
                className="text-sm sm:text-base hidden md:inline font-medium text-lightgray/80"
              >
                Clear Answer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className=" px-4 py-4 backdrop-blur-md md:hidden">
          <div className="mt-1 flex gap-3">
            <button
              type="button"
              disabled={idx === 0}
              onClick={handlePreviousQuestion}
              className="flex h-12 flex-1 items-center justify-center gap-1 rounded-full border border-[rgba(8,22,39,0.14)] bg-white text-sm font-semibold text-lightgray shadow-sm transition-colors enabled:active:bg-[rgba(8,22,39,0.04)] disabled:bg-[rgba(8,22,39,0.05)] disabled:text-lightgray/30 disabled:border-[rgba(8,22,39,0.08)] disabled:cursor-not-allowed disabled:shadow-none"
            >
              <ArrowLeft className="size-4 shrink-0" strokeWidth={2.25} />
              Previous
            </button>
            {idx >= total - 1 ? (
              <Link
                to={finishLink}
                className="primary-btn flex h-12 flex-1 items-center justify-center gap-1 rounded-full text-sm font-semibold"
              >
                Finish
                <ArrowRight className="size-4 shrink-0" strokeWidth={2.25} />
              </Link>
            ) : (
              <button
                type="button"
                disabled={selected === null}
                onClick={handleNextQuestion}
                className="primary-btn flex h-12 flex-1 items-center justify-center gap-1 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="size-4 shrink-0" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
        {/* bottom bar */}
        <div className="hidden  items-center justify-center h-[120px] border-t border-[rgba(8,22,39,0.08)] bg-white/95 backdrop-blur-md md:flex">
          <div className="custom-container flex items-center justify-between gap-4">
            <span className="w-10 text-right text-3xl font-semibold tabular-nums text-lightgray">
              {formatTime(elapsed)}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className=" w-fit items-center justify-center gap-3 rounded-[38px] px-6 py-3 text-lg font-medium text-lightgray/80 leading-[120%] inline-flex"
              >
                Skip Question
              </button>
              <button
                type="button"
                disabled={idx === 0}
                onClick={handlePreviousQuestion}
                className="border border-lightgray/10 w-fit items-center justify-center gap-3 rounded-[38px] px-6 py-3 text-lg font-medium text-lightgray/80 leading-[120%] inline-flex disabled:border-lightgray/5 disabled:text-lightgray/25 disabled:bg-[rgba(8,22,39,0.05)] disabled:cursor-not-allowed"
              >
                <ArrowLeft size={24} />
                Previous
              </button>
              {idx >= total - 1 ? (
                <Link
                  to={finishLink}
                  className="primary-btn w-fit items-center justify-center gap-3 rounded-[38px] px-6 py-3 text-lg font-medium leading-[120%] inline-flex"
                >
                  Finish
                  <ArrowRight size={24} />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={selected === null}
                  onClick={handleNextQuestion}
                  className="primary-btn w-fit items-center justify-center gap-3 rounded-[38px] px-6 py-3 text-lg font-medium leading-[120%] inline-flex disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuizResultScreen({ session }: { session: QuizSession }) {
  const r = session.result;
  if (!r) {
    return (
      <div className="relative min-h-dvh overflow-x-hidden bg-linear-to-b from-[#ebe8ff] via-[#f3f5ff] to-[#f8fafc] pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] md:bg-[#f5f7ff] md:pt-28 md:from-transparent md:via-transparent md:to-transparent">
        <div className="hidden md:block">
          <QuizTopBar progress={1} variant="result" />
        </div>
        <div className="custom-container relative max-w-lg px-4 text-center sm:px-6 md:pt-4">
          <p className="text-base text-lightgray/80 md:text-lg">
            Results are not available for this quiz yet. Complete a quiz to see
            your score here.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/free-resources/quizzes/${session.slug}/start`}
              className="rounded-full border border-[rgba(58,107,252,0.2)] bg-white py-3 text-center text-sm font-semibold text-[#3a6bfc] md:text-base md:font-medium"
            >
              Go to quiz intro
            </Link>
            <Link
              to="/free-resources"
              className="primary-btn rounded-full py-3 text-center text-sm font-semibold md:text-base md:font-medium"
            >
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden opacity-100"
        aria-hidden
        style={{
          backgroundImage: 'url(/assets/images/quiz-page/quiz-result-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* top bar  */}
      <div className="hidden md:block">
        <QuizTopBar progress={1} variant="result" />
      </div>
      {/* content */}
      <div className="custom-container relative px-3 sm:px-6 py-16">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-7 md:gap-16">
          <div className="flex flex-col gap-5 md:gap-9">
            <div className="flex w-full flex-col items-center gap-6 text-center md:gap-9">
              <div className="flex w-full flex-col items-center gap-3 md:gap-5">
                {/* first row */}
                <div className="hidden flex-wrap items-center justify-center gap-2 md:flex">
                  <div
                    className={`flex items-center gap-2 rounded-[40px] border px-3 py-1 text-base font-medium leading-[120%] ${r.subject.bg} ${r.subject.border} ${r.subject.text}`}
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${r.subject.dot}`}
                    />
                    {r.subject.label}
                  </div>
                  <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 text-base font-medium leading-[120%] text-lightgray/50">
                    {r.board}
                  </div>
                  <span className={difficultyTextClass[r.difficulty]}>
                    {r.difficulty === 'easy'
                      ? '(Easy)'
                      : r.difficulty === 'medium'
                      ? '(Medium)'
                      : '(HARD)'}
                  </span>
                </div>
                {/* quiz title */}
                <h1 className="w-full text-center text-xl leading-[120%] tracking-[-0.56px] text-lightgray md:text-3xl font-semibold md:tracking-[-0.72px] lg:text-4xl">
                  {r.quizTitle}
                </h1>
                <p className="max-w-[520px] text-center text-[15px] leading-[155%] text-lightgray md:hidden">
                  {session.subtitle}
                </p>
              </div>
              {/* score */}
              <div className="flex w-full flex-col items-center gap-3 text-lightgray md:gap-5">
                <p className="text-center text-xs font-semibold uppercase leading-normal tracking-[0.12em] text-[#8b7ec9] md:text-sm md:tracking-[1px] md:text-lightgray md:opacity-50">
                  Score
                </p>
                <p className="text-center text-[clamp(3rem,14vw,4.5rem)] font-light leading-none tracking-[-3px] md:text-[clamp(3.5rem,12vw,5.5rem)] md:tracking-[-4.4px]">
                  {r.scorePercent}
                </p>
              </div>
              {/* summary text */}
              <p className="md:max-w-[920px] w-full text-center text-base font-medium leading-[150%] text-lightgray/55 md:text-xl md:leading-[120%]">
                {r.scoreSummaryBefore}
                <span className="font-medium text-lightgray">
                  {r.scoreSummaryBold}
                </span>
                {r.scoreSummaryAfter}
              </p>
            </div>
            {/* results stats */}
            <ResultStatStrip
              totalQs={r.totalQs}
              correct={r.correct}
              wrong={r.wrong}
              skipped={r.skipped}
            />
            {/* action buttons */}
            <div className="flex w-full px-4 flex-row items-stretch justify-center gap-3">
              <Link
                to={`/free-resources/quizzes/${session.slug}/start`}
                className="primary-btn flex min-h-[50px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[30px] px-3 py-2 text-sm font-medium leading-tight md:inline-flex md:min-h-[56px] md:w-auto md:flex-none md:gap-3 md:rounded-[38px] md:px-6 md:py-4 md:text-xl md:font-medium md:leading-[120%]"
              >
                <RotateCcw
                  className="size-5 shrink-0 text-white md:size-8"
                  strokeWidth={2}
                />
                <span className="text-center">Retake Quiz</span>
              </Link>
              <Link
                to="/free-resources"
                className="flex min-h-[50px] min-w-0 flex-1 items-center justify-center rounded-[30px] border border-[rgba(8,22,39,0.1)] bg-white px-3 py-2 text-center text-sm font-medium leading-tight text-lightgray/80 transition-colors hover:bg-white/90 md:inline-flex md:min-h-[56px] md:w-auto md:flex-none md:rounded-[38px] md:px-6 md:py-4 md:text-xl md:font-medium md:leading-[120%]"
              >
                Back to Resources
              </Link>
            </div>
          </div>

          {/* question by question breakdown */}
          <div className="w-full px-3">
            <h2 className="text-lg font-bold leading-[120%] tracking-[-0.2px] text-lightgray md:text-2xl md:font-medium md:tracking-[-0.24px]">
              Question by Question Breakdown
            </h2>
            <ul className="mt-4 flex flex-col gap-4 md:mt-6 md:gap-5">
              {r.breakdown.map((row, i) => (
                <li
                  key={`${row.question}-${i}`}
                  className="flex flex-col gap-4 rounded-2xl border border-[rgba(8,22,39,0.06)] bg-white p-4 shadow-[0_1px_3px_rgba(8,22,39,0.06)] md:gap-5 md:border-none md:p-5"
                >
                  <div className="flex gap-3 border-b border-[rgba(8,22,39,0.1)] pb-4 flex-row sm:items-start sm:justify-between sm:gap-4 md:pb-5">
                    <p className="min-w-0 flex-1 text-left text-base font-semibold leading-[135%] text-lightgray md:text-xl md:font-medium md:leading-[120%]">
                      {row.question}
                    </p>
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border border-[rgba(8,22,39,0.1)] sm:mt-0.5 ${
                        row.correct ? 'bg-[#12caa5]' : 'bg-[#ea502a]'
                      }`}
                      aria-label={row.correct ? 'Correct' : 'Incorrect'}
                    >
                      {row.correct ? (
                        <Check
                          className="size-4 text-white"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <X className="size-3.5 text-white" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex min-w-0 flex-col gap-2 sm:gap-[15px]">
                      <span className="text-[11px] font-semibold uppercase leading-normal tracking-[0.08em] text-lightgray/50 sm:text-sm sm:tracking-[1px]">
                        Your answer
                      </span>
                      <div className="rounded-lg border border-[rgba(8,22,39,0.1)] bg-white px-2.5 py-2.5 sm:px-[17px] sm:py-3.5">
                        <p className="text-[13px] font-medium leading-[140%] text-lightgray sm:text-base sm:leading-[150%]">
                          {row.yourAnswer}
                        </p>
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 sm:gap-[15px]">
                      <span className="text-[11px] font-semibold uppercase leading-normal tracking-[0.08em] text-lightgray/50 sm:text-sm sm:tracking-[1px]">
                        Correct answer
                      </span>
                      <div className="rounded-lg border border-[rgba(8,22,39,0.1)] bg-[rgba(8,22,39,0.05)] px-2.5 py-2.5 sm:px-[17px] sm:py-3.5">
                        <p className="text-[13px] font-medium leading-[140%] text-lightgray sm:text-base sm:leading-[150%]">
                          {row.correctAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
