import React, { useState } from 'react';
import { Link } from '@remix-run/react';
import { Download, Eye, Play, FileText, Link2, Clock } from 'lucide-react';
import type { ContentItem } from '~/utils/bbServer';

const SUBJECT_COLORS = [
  { dot: 'bg-[#1764d4]', bg: 'bg-[rgba(23,100,212,0.05)]', border: 'border-[rgba(23,100,212,0.1)]', text: 'text-[#1764d4]' },
  { dot: 'bg-[#0baf7e]', bg: 'bg-[rgba(11,175,126,0.05)]', border: 'border-[rgba(11,175,126,0.1)]', text: 'text-[#0baf7e]' },
  { dot: 'bg-[#ba7517]', bg: 'bg-[rgba(186,117,23,0.05)]', border: 'border-[rgba(186,117,23,0.1)]', text: 'text-[#ba7517]' },
  { dot: 'bg-[#7b36ec]', bg: 'bg-[rgba(123,54,236,0.05)]', border: 'border-[rgba(123,54,236,0.1)]', text: 'text-[#7b36ec]' },
  { dot: 'bg-[#6b7c5e]', bg: 'bg-[rgba(107,124,94,0.05)]', border: 'border-[rgba(107,124,94,0.1)]', text: 'text-[#6b7c5e]' },
  { dot: 'bg-[#4a6fa5]', bg: 'bg-[rgba(74,111,165,0.05)]', border: 'border-[rgba(74,111,165,0.1)]', text: 'text-[#4a6fa5]' },
  { dot: 'bg-[#f5a0ad]', bg: 'bg-[rgba(245,160,173,0.05)]', border: 'border-[rgba(245,160,173,0.1)]', text: 'text-[#d4647a]' },
];

function colorForSubject(subjectName: string) {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function SubjectBadge({ name }: { name: string }) {
  const c = colorForSubject(name);
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm md:text-base font-medium leading-[150%] lg:text-base lg:leading-[150%] ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`size-2 shrink-0 rounded-full ${c.dot}`} />
      {name}
    </div>
  );
}

function ChapterLabel({ name }: { name: string | null }) {
  if (!name) return null;
  return <p className="text-sm font-medium text-lightgray/50">{name}</p>;
}

function CardShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col justify-between overflow-hidden gap-5 rounded-2xl bg-white py-6 ring-1 ring-[rgba(8,22,39,0.06)]">
      <div className="flex w-full min-w-0 flex-col gap-3">{children}</div>
      {footer && <div className="flex w-full gap-3 px-3 md:px-6">{footer}</div>}
    </article>
  );
}

function ViewButton({ href, label = 'View' }: { href?: string; label?: string }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium leading-[150%] text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
      >
        <Eye className="size-5 shrink-0" />
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled
      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium leading-[150%] text-[#3a6bfc] opacity-50 cursor-not-allowed lg:text-base lg:leading-[150%]"
    >
      <Eye className="size-5 shrink-0" />
      {label}
    </button>
  );
}

function DownloadButton({ href, label = 'Download' }: { href?: string; label?: string }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[#0816271A] bg-white text-sm font-medium leading-[150%] text-gray-700 transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base lg:leading-[150%]"
      >
        <Download className="size-5 shrink-0" />
        {label}
      </a>
    );
  }
  return null;
}

function NoteCard({ item, subjectName }: { item: ContentItem; subjectName: string }) {
  return (
    <CardShell
      footer={
        <>
          <ViewButton href={item.pdfUrl} />
          {item.isDownloadable && <DownloadButton href={item.pdfUrl} />}
        </>
      }
    >
      <div className="flex flex-wrap gap-2 px-3 md:px-6">
        <SubjectBadge name={subjectName} />
      </div>
      <div className="px-3 md:px-6">
        <ChapterLabel name={item.chapterName} />
      </div>
      <div className="px-3 md:px-6">
        <h2 className="line-clamp-2 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
      {item.subtitle && (
        <div className="px-3 md:px-6">
          <p className="text-sm font-medium leading-[150%] text-lightgray/50 lg:text-base lg:leading-[150%]">
            {item.subtitle}
          </p>
        </div>
      )}
    </CardShell>
  );
}

function VideoCard({
  item,
  subjectName,
  onWatch,
}: {
  item: ContentItem;
  subjectName: string;
  onWatch?: (videoId: string, title: string) => void;
}) {
  const thumbSrc =
    item.thumbnailUrl ||
    (item.videoId
      ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`
      : undefined);

  return (
    <article className="flex flex-col gap-4 sm:gap-6 overflow-hidden rounded-2xl bg-white p-4 sm:p-5 xl:p-6">
      {thumbSrc && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#081627]">
          <button
            type="button"
            onClick={() => item.videoId && onWatch?.(item.videoId, item.name)}
            className="relative block size-full text-left cursor-pointer"
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
            {item.duration && (
              <div className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-white/15 bg-white/15 px-2 py-0.5 text-sm font-medium text-white backdrop-blur-[17px]">
                {item.duration}
              </div>
            )}
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <SubjectBadge name={subjectName} />
        </div>
        <ChapterLabel name={item.chapterName} />
        <h2 className="line-clamp-2 text-lg sm:text-xl font-medium leading-[150%] tracking-[-0.24px] text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
      <div className="mt-auto flex w-full gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => item.videoId && onWatch?.(item.videoId, item.name)}
          disabled={!item.videoId}
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="size-5 shrink-0 fill-current" strokeWidth={0} />
          Watch Now
        </button>
      </div>
    </article>
  );
}

function TestCard({ item, subjectName }: { item: ContentItem; subjectName: string }) {
  const meta = [
    item.questionCount && `${item.questionCount} Questions`,
    item.totalMarks != null && `${item.totalMarks} Marks`,
    item.testDuration != null && `${item.testDuration} Minutes`,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <CardShell
      footer={
        <Link
          to={`/free-resources/quizzes/${item.id}/start`}
          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[38px] border border-[rgba(58,107,252,0.2)] bg-white text-sm font-medium text-[#3a6bfc] transition-colors hover:bg-[rgba(58,107,252,0.06)] lg:text-base"
        >
          <Play className="size-4 shrink-0 fill-[#3a6bfc] text-[#3a6bfc]" />
          Start Quiz
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2 px-3 md:px-6">
        <SubjectBadge name={subjectName} />
        {item.difficulty && (
          <div className="rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 text-sm font-medium text-lightgray/50 capitalize lg:text-base">
            {item.difficulty}
          </div>
        )}
      </div>
      <div className="px-3 md:px-6">
        <ChapterLabel name={item.chapterName} />
      </div>
      <div className="px-3 md:px-6">
        <h2 className="line-clamp-2 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
      {meta && (
        <div className="px-3 md:px-6">
          <p className="text-sm font-medium leading-[150%] text-lightgray/50 lg:text-base lg:leading-[150%]">
            {meta}
          </p>
        </div>
      )}
    </CardShell>
  );
}

function SubjectiveTestCard({
  item,
  subjectName,
}: {
  item: ContentItem;
  subjectName: string;
}) {
  const meta = [
    item.totalQuestions != null && `${item.totalQuestions} Questions`,
    item.totalMarks != null && `${item.totalMarks} Marks`,
    item.durationMinutes != null && `${item.durationMinutes} Minutes`,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <CardShell
      footer={
        <>
          <ViewButton href={item.questionPaperUrl ?? undefined} label="Question Paper" />
          <DownloadButton href={item.answersUrl ?? undefined} label="Answers" />
        </>
      }
    >
      <div className="flex flex-wrap gap-2 px-3 md:px-6">
        <SubjectBadge name={subjectName} />
      </div>
      <div className="px-3 md:px-6">
        <ChapterLabel name={item.chapterName} />
      </div>
      <div className="px-3 md:px-6">
        <h2 className="line-clamp-2 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
      {meta && (
        <div className="px-3 md:px-6">
          <p className="text-sm font-medium leading-[150%] text-lightgray/50 lg:text-base lg:leading-[150%]">
            {meta}
          </p>
        </div>
      )}
    </CardShell>
  );
}

function ResourceCard({
  item,
  subjectName,
}: {
  item: ContentItem;
  subjectName: string;
}) {
  return (
    <CardShell
      footer={
        <ViewButton href={item.url} label="Open" />
      }
    >
      <div className="flex flex-wrap gap-2 px-3 md:px-6">
        <SubjectBadge name={subjectName} />
        {item.resourceType && (
          <div className="flex items-center gap-1 rounded border border-[rgba(8,22,39,0.1)] px-3 py-1 text-sm font-medium text-lightgray/50 lg:text-base">
            <Link2 className="size-3.5" />
            {item.resourceType}
          </div>
        )}
      </div>
      <div className="px-3 md:px-6">
        <ChapterLabel name={item.chapterName} />
      </div>
      <div className="px-3 md:px-6">
        <h2 className="line-clamp-2 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
    </CardShell>
  );
}

function LiveCard({ item, subjectName }: { item: ContentItem; subjectName: string }) {
  return (
    <CardShell>
      <div className="flex flex-wrap gap-2 px-3 md:px-6">
        <SubjectBadge name={subjectName} />
        <div className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-sm font-medium text-red-600">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          Live
        </div>
      </div>
      <div className="px-3 md:px-6">
        <ChapterLabel name={item.chapterName} />
      </div>
      <div className="px-3 md:px-6">
        <h2 className="line-clamp-2 text-xl font-medium leading-[150%] tracking-tight text-lightgray lg:leading-[150%]">
          {item.name}
        </h2>
      </div>
      {item.thumbnailUrl && (
        <div className="px-3 md:px-6">
          <img
            src={item.thumbnailUrl}
            alt=""
            className="w-full rounded-xl object-cover aspect-video"
          />
        </div>
      )}
    </CardShell>
  );
}

export function ContentCardItem({
  item,
  subjectName,
  onWatchVideo,
}: {
  item: ContentItem;
  subjectName: string;
  onWatchVideo?: (videoId: string, title: string) => void;
}) {
  switch (item.type) {
    case 'note':
      return <NoteCard item={item} subjectName={subjectName} />;
    case 'video':
      return <VideoCard item={item} subjectName={subjectName} onWatch={onWatchVideo} />;
    case 'test':
      return <TestCard item={item} subjectName={subjectName} />;
    case 'subjectiveTest':
      return <SubjectiveTestCard item={item} subjectName={subjectName} />;
    case 'resource':
      return <ResourceCard item={item} subjectName={subjectName} />;
    case 'live':
      return <LiveCard item={item} subjectName={subjectName} />;
    default:
      return null;
  }
}
