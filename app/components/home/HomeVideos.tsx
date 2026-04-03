import type { HomeVideo } from '~/providers/home/types';
import { useState } from 'react';
import { PlayCircle, X, ChevronRight } from 'lucide-react';

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      // Fallback for other youtube.com paths
      return `https://www.youtube.com/embed/${parsed.pathname.replace(
        '/shorts/',
        '',
      )}?autoplay=1`;
    }

    // Short URL: https://youtu.be/VIDEO_ID
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
  } catch {
    // ignore parsing errors
  }

  return url;
}

export default function HomeVideos({
  heading,
  youtubeChannelLink,
  videos,
}: {
  heading: string;
  videos: HomeVideo[];
  youtubeChannelLink?: string;
}) {
  const [activeVideo, setActiveVideo] = useState<HomeVideo | null>(null);

  const embedUrl = activeVideo?.url ? getYouTubeEmbedUrl(activeVideo.url) : '';

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Learn from expert insights and tips
            </p>
          </div>
          {youtubeChannelLink && (
            <a
              href={youtubeChannelLink}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#4aaeed] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3a9de0] transition-colors shadow-sm"
            >
              Subscribe
              <ChevronRight className="h-4 w-4 text-white" aria-hidden="true" />
            </a>
          )}
        </div>
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {videos.map((video, index) => {
                const key = video.id || video.url || index;
                const thumbnail = video.thumbnail || '';

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveVideo(video)}
                    className="group block text-left focus:outline-none"
                  >
                    <div className="overflow-hidden rounded-lg border border-slate-700 relative bg-slate-800 shadow-sm group-hover:shadow-lg transition-shadow">
                      {thumbnail ? (
                        <>
                          <img
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                            src={thumbnail}
                            alt={video.title || 'Video'}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                            <PlayCircle className="h-12 w-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-bold text-black leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {video.title || 'Watch video'}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
            {youtubeChannelLink && (
              <div className="mt-8 sm:hidden flex justify-center">
                <a
                  href={youtubeChannelLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors shadow-sm w-full"
                >
                  Subscribe to channel
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="w-full aspect-video bg-slate-800 rounded-lg border border-slate-700" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
            <div className="col-span-full text-center py-8">
              <p className="text-slate-400 text-sm">
                Videos coming soon! Check back shortly for new content.
              </p>
            </div>
          </div>
        )}

        {activeVideo && embedUrl && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="relative w-full max-w-4xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-8 -right-8 z-[81] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-100 transition-colors"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  title={activeVideo.title || 'Video player'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              {activeVideo.title && (
                <p className="mt-4 text-sm text-white text-center line-clamp-2">
                  {activeVideo.title}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
