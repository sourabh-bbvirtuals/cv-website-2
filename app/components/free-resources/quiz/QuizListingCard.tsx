import { Link } from '@remix-run/react';
import { Play } from 'lucide-react';
import type { QuizListCard } from './quizData';
import { difficultyTextClass } from './quizData';

export function QuizListingCard({ card }: { card: QuizListCard }) {
  const attempted = card.attempted;
  const metaParts = card.metaLine.split(/\s*[•·]\s*/);

  return (
    <article className="relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-[rgba(8,22,39,0.06)]">
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 text-sm lg:text-base">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm lg:text-base font-medium ${card.subject.bg} ${card.subject.border} ${card.subject.text}`}
          >
            <span
              className={`size-2 shrink-0 rounded-full ${card.subject.dot}`}
            />
            {card.subject.label}
          </div>
          <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 font-medium text-lightgray/50 text-sm lg:text-base">
            {card.board}
          </div>
          <span className={difficultyTextClass[card.difficulty]}>
            {card.difficulty === 'easy'
              ? '(Easy)'
              : card.difficulty === 'medium'
              ? '(Medium)'
              : '(HARD)'}
          </span>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3">
          <h2 className="line-clamp-1 text-xl font-medium tracking-[-0.24px] text-lightgray lg:text-2xl">
            {card.title}
          </h2>
          <div className="flex min-w-0 items-center gap-2 text-sm font-normal leading-normal text-lightgray/80 lg:text-base">
            {metaParts.map((part, i) => (
              <div
                key={`${card.slug}-${part}-${i}`}
                className="flex items-center gap-2"
              >
                {i > 0 ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-[rgba(8,22,39,0.45)]"
                    aria-hidden
                  />
                ) : null}
                <span className="truncate">{part}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {attempted ? (
        <div className="mt-16 flex w-full gap-3">
          <Link
            to={`/free-resources/quizzes/${card.slug}/result`}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 shrink-0"
              aria-hidden
            >
              <path
                d="M18.7503 4.375V9.375C18.7504 9.49868 18.7138 9.61962 18.6452 9.72249C18.5765 9.82536 18.4789 9.90554 18.3646 9.95289C18.2503 10.0002 18.1246 10.0126 18.0033 9.98846C17.882 9.9643 17.7706 9.9047 17.6832 9.81719L15.6253 7.75859L11.0675 12.3172C11.0095 12.3753 10.9406 12.4214 10.8647 12.4529C10.7888 12.4843 10.7075 12.5005 10.6253 12.5005C10.5432 12.5005 10.4619 12.4843 10.386 12.4529C10.3101 12.4214 10.2412 12.3753 10.1832 12.3172L7.50035 9.63359L2.31754 14.8172C2.20026 14.9345 2.0412 15.0003 1.87535 15.0003C1.7095 15.0003 1.55044 14.9345 1.43316 14.8172C1.31588 14.6999 1.25 14.5409 1.25 14.375C1.25 14.2091 1.31588 14.0501 1.43316 13.9328L7.05816 8.30781C7.11621 8.2497 7.18514 8.2036 7.26101 8.17215C7.33688 8.1407 7.41821 8.12451 7.50035 8.12451C7.58248 8.12451 7.66381 8.1407 7.73969 8.17215C7.81556 8.2036 7.88449 8.2497 7.94254 8.30781L10.6253 10.9914L14.7418 6.875L12.6832 4.81719C12.5957 4.72978 12.536 4.61837 12.5119 4.49707C12.4877 4.37576 12.5001 4.25002 12.5475 4.13576C12.5948 4.02149 12.675 3.92384 12.7779 3.85517C12.8807 3.78651 13.0017 3.7499 13.1253 3.75H18.1253C18.2911 3.75 18.4501 3.81585 18.5673 3.93306C18.6845 4.05027 18.7503 4.20924 18.7503 4.375Z"
                fill="#3A6BFC"
              />
            </svg>
            View Result
          </Link>
          <Link
            to={`/free-resources/quizzes/${card.slug}/start`}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(8,22,39,0.1)] bg-white text-sm font-medium text-lightgray/80 transition-colors hover:bg-lightgray/5 lg:text-base"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 shrink-0"
              aria-hidden
            >
              <g opacity="0.8">
                <path
                  d="M18.7504 4.3743V8.1243C18.7504 8.29006 18.6846 8.44903 18.5674 8.56624C18.4501 8.68345 18.2912 8.7493 18.1254 8.7493H14.3754C14.2097 8.7493 14.0507 8.68345 13.9335 8.56624C13.8163 8.44903 13.7504 8.29006 13.7504 8.1243C13.7504 7.95854 13.8163 7.79957 13.9335 7.68236C14.0507 7.56515 14.2097 7.4993 14.3754 7.4993H16.516L14.4387 5.59617L14.4192 5.57742C13.5505 4.70905 12.4452 4.1159 11.2413 3.87207C10.0375 3.62823 8.78847 3.74452 7.65033 4.20641C6.51219 4.66829 5.53538 5.4553 4.84193 6.46911C4.14847 7.48292 3.76911 8.67859 3.75124 9.90675C3.73337 11.1349 4.07779 12.3411 4.74145 13.3747C5.40512 14.4082 6.35862 15.2233 7.48284 15.7181C8.60706 16.2129 9.85215 16.3655 11.0626 16.1568C12.273 15.9481 13.3951 15.3873 14.2887 14.5446C14.4092 14.4306 14.57 14.3692 14.7358 14.3738C14.9016 14.3784 15.0587 14.4487 15.1727 14.5692C15.2866 14.6897 15.3481 14.8505 15.3435 15.0163C15.3388 15.1821 15.2686 15.3392 15.1481 15.4532C13.7586 16.771 11.9154 17.5036 10.0004 17.4993H9.89729C8.66896 17.4825 7.46357 17.1642 6.38705 16.5724C5.31054 15.9806 4.39587 15.1335 3.72343 14.1054C3.05099 13.0774 2.64137 11.8999 2.53057 10.6764C2.41977 9.45301 2.61119 8.22109 3.088 7.08895C3.56481 5.95682 4.31241 4.95913 5.26509 4.18359C6.21778 3.40805 7.34638 2.87839 8.5517 2.64117C9.75703 2.40395 11.0022 2.46643 12.1777 2.82311C13.3532 3.1798 14.4231 3.81978 15.2934 4.6868L17.5004 6.70242V4.3743C17.5004 4.20854 17.5663 4.04957 17.6835 3.93236C17.8007 3.81515 17.9597 3.7493 18.1254 3.7493C18.2912 3.7493 18.4501 3.81515 18.5674 3.93236C18.6846 4.04957 18.7504 4.20854 18.7504 4.3743Z"
                  fill="#081627"
                />
              </g>
            </svg>
            Re-take Quiz
          </Link>
        </div>
      ) : (
        <Link
          to={`/free-resources/quizzes/${card.slug}/start`}
          className="mt-16 flex h-9 w-full items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base"
        >
          <Play className="size-5 shrink-0 fill-[#3a6bfc] text-[#3a6bfc]" />
          Start Quiz
        </Link>
      )}
    </article>
  );
}
