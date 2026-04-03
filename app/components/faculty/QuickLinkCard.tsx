export const QuickLinkCard = ({
  url,
  icon,
  title,
}: {
  idx: number;
  url: string;
  icon: string;
  title: string;
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 border border-[#E6EEF8] rounded-xl hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div dangerouslySetInnerHTML={{ __html: icon }} />
        <span className="font-normal text-[#0F1724] text-base">
          {title}
        </span>
      </div>
      <svg
        className="w-4 h-4 text-[#9CA3AF]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </a>
  );
};
