import { PlayCircle } from 'lucide-react'; // Assuming Lucide icons; adjust if using another library

// Define the expected shape of a YouTube video
interface YouTubeVideo {
  id: string;
  url: string;
  title: string;
  secondaryTitle: string;
  thumbnail: string;
}

const YouTubeVideos = ({ youtubeVideos }: { youtubeVideos: string }) => {
  // Parse JSON string to array, default to empty array if invalid or undefined
  let videos: YouTubeVideo[] = [];
  try {
    if (youtubeVideos) {
      const parsed = JSON.parse(youtubeVideos);
      if (Array.isArray(parsed)) {
        videos = parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse youtubeVideos JSON:', e);
  }

  return videos.length > 0 ? (
    <div className="max-w-7xl mt-32 mx-auto px-1">
      <h2 className="text-xl font-bold text-center mb-6 pb-2">Demo Videos</h2>
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4">
        {videos.map((video) => (
          <div className="flex-col flex" key={video.id}>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[300px] sm:w-[350px] snap-center"
            >
              <div className="relative group cursor-pointer">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    width={350}
                    height={200}
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full backdrop-blur-md bg-white/20">
                      <PlayCircle className="w-12 h-12 text-white opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm">{video.secondaryTitle}</p>
                <p className="text-xl font-semibold">{video.title}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default YouTubeVideos;
