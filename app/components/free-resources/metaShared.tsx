import React from 'react';

/** Muted meta separators — same light grey for circle dot + `•` / `·` in all tabs */
export const metaSepDotClass =
  'size-1.5 shrink-0 rounded-full bg-[rgba(8,22,39,0.28)]';
export const metaSepCharClass = 'shrink-0 text-[rgba(8,22,39,0.28)]';

export function MetaLineWithBullets({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(/\s*[•·]\s*/);
  if (parts.length <= 1) {
    return <p className={className}>{text}</p>;
  }
  return (
    <p className={className}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <span className={`mx-1 ${metaSepCharClass}`} aria-hidden>
              •
            </span>
          ) : null}
          {part}
        </React.Fragment>
      ))}
    </p>
  );
}
