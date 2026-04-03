import { useEffect, useState } from 'react';
import type { LayoutAnnouncement } from '~/providers/announcements';

interface AnnouncementBarProps {
  announcements?: LayoutAnnouncement[];
  className?: string;
}

export function AnnouncementBar({
  announcements = [],
  className = '',
}: AnnouncementBarProps) {
  const [index, setIndex] = useState(0);

  const hasAnnouncements = announcements && announcements.length > 0;

  useEffect(() => {
    if (!hasAnnouncements) return;

    // Reset to first announcement when the list changes
    setIndex(0);

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [hasAnnouncements, announcements.length]);

  if (!hasAnnouncements) return null;

  const current = announcements[index];

  return (
    <>
      <style>
        {`
          @keyframes sa-announcement-enter {
            0% {
              transform: translateX(12px);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .sa-announcement-enter {
            animation: sa-announcement-enter 0.35s ease-out;
          }
        `}
      </style>
      <div className={`w-full bg-[#1c212f] text-white ${className}`}>
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start py-2 text-[13px] overflow-hidden">
            <div className="sa-announcement-enter flex items-center gap-2 w-full">
              <span className="inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                {current.tag}
              </span>
              <p className="text-[#8d8f95] text-[12px] sm:text-[13px] truncate">
                {current.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

