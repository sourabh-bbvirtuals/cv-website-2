import { LinkButton } from "./shared/LinkButton";

export const YoutubeVideoCard = ({
  id,
  youtubeUrl,
  thumbnail,
  title,
  views,
  timeAgo,
  openVideo,
}: {
  id: string;
  youtubeUrl: string;
  thumbnail: string;
  title: string;
  views: string;
  timeAgo: string;
  openVideo: (url: string) => void;
}) => {
  return (
    <div
      key={id}
      className="bg-[#FBFAF9] border border-[#E8E8E8] rounded-2xl p-0 space-y-4"
    >
      <button
        onClick={() => openVideo(youtubeUrl)}
        className="relative w-full h-28 bg-[#E3E3E3] rounded-t-xl overflow-hidden text-left"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>

      <div className="space-y-2 px-4">
        <h3 className="font-semibold text-black text-xs">{title}</h3>
        <p className="text-xs text-[#787878]">
          {views} • {timeAgo}
        </p>
      </div>
      <div className="mb-2 mx-2 py-2">
        {youtubeUrl && (
          <LinkButton href={youtubeUrl} external>
            Watch on YouTube
          </LinkButton>
        )}
      </div>
    </div>
  );
};
