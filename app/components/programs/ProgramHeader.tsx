import React, { useState } from 'react';
import { LanguagesIcon, PlayCircleIcon, X, FileTextIcon, HardDriveIcon, FileIcon } from 'lucide-react';

interface ProgramHeader {
  slug: string;
  title: string;
  subtitle: string;
  attempt?: Array<string>;
  additionalFeatures?: {
    demoLecture?: Array<{ url: string; title?: string }>;
    demoBook?: Array<{ url: string; type?: string; thumbnail?: string }>;
  };
}

interface ProgramHeaderProps {
  program: ProgramHeader;
}

export function ProgramHeader({ program }: ProgramHeaderProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Function to get file type thumbnail image
  const getFileTypeThumbnail = (demoBook: any) => {
    const type = demoBook.type?.toLowerCase();
    const url = demoBook.url?.toLowerCase() || '';
    
    // Check explicit type first
    if (type === 'pdf' || url.includes('.pdf')) {
      return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=80&h=56&fit=crop&crop=center'; // PDF thumbnail
    }
    if (type === 'drive' || type === 'usb' || type === 'pendrive') {
      return 'https://images.unsplash.com/photo-1597872200964-2b65d56bd16b?w=80&h=56&fit=crop&crop=center'; // USB/Drive thumbnail
    }
    if (type === 'document' || url.includes('.doc') || url.includes('.docx')) {
      return 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=80&h=56&fit=crop&crop=center'; // Document thumbnail
    }
    
    // Default file thumbnail
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=56&fit=crop&crop=center';
  };

  // Function to get file type overlay icon
  const getFileTypeOverlayIcon = (demoBook: any) => {
    const type = demoBook.type?.toLowerCase();
    const url = demoBook.url?.toLowerCase() || '';
    
    // Check explicit type first
    if (type === 'pdf' || url.includes('.pdf')) {
      return <FileTextIcon className="w-6 h-6 text-white" />;
    }
    if (type === 'drive' || type === 'usb' || type === 'pendrive') {
      return <HardDriveIcon className="w-6 h-6 text-white" />;
    }
    if (type === 'document' || url.includes('.doc') || url.includes('.docx')) {
      return <FileTextIcon className="w-6 h-6 text-white" />;
    }
    
    // Default file icon
    return <FileIcon className="w-6 h-6 text-white" />;
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to generate YouTube thumbnail URL
  const getYouTubeThumbnail = (videoUrl: string): string => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      if (videoUrl.includes('/live/')) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '';
  };

  // Function to convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (videoUrl: string): string => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      if (videoUrl.includes('/live/')) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&start=1`;
    }
    return videoUrl;
  };

  return (
    <aside className="bg-white rounded-xl shadow-sm ring-1 ring-neutral-200 p-4">
      {(program.additionalFeatures?.demoLecture ||
        program.additionalFeatures?.demoBook) && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Demo Lectures */}
          {program.additionalFeatures?.demoLecture &&
            program.additionalFeatures?.demoLecture.length > 0 &&
            program.additionalFeatures.demoLecture.map((lecture: any, index: number) => (
              <button
                key={`demo-lecture-${index}`}
                onClick={() => {
                  if (lecture.url) {
                    setSelectedVideoUrl(lecture.url);
                    setShowVideoModal(true);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="relative flex-shrink-0 w-20 h-14">
                  <img
                    src={lecture.url ? getYouTubeThumbnail(lecture.url) : ''}
                    alt="Demo Lecture Thumbnail"
                    className="w-full h-full rounded-lg object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (lecture.url) {
                        const videoId = getYouTubeVideoId(lecture.url);
                        if (videoId) {
                          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg group-hover:bg-black/30 transition-all duration-200">
                    <PlayCircleIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-slate-900 group-hover:text-slate-800 truncate">
                    Demo Lecture
                  </div>
                  <div className="text-xs text-slate-600 group-hover:text-slate-700 truncate">
                    Watch free preview
                  </div>
                </div>
              </button>
            ))}
          {/* Demo Books */}
          {program.additionalFeatures?.demoBook &&
            program.additionalFeatures?.demoBook.length > 0 &&
            program.additionalFeatures.demoBook.map((book: any, index: number) => (
              <button
                key={`demo-book-${index}`}
                onClick={() => {
                  if (book.url) {
                    window.open(book.url, '_blank');
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="relative flex-shrink-0 w-20 h-14">
                  {book.thumbnail ? (
                    <>
                      <img
                        src={book.thumbnail}
                        alt="Demo Book Thumbnail"
                        className="w-full h-full rounded-lg object-cover ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const iconContainer = target.nextElementSibling as HTMLElement;
                          if (iconContainer) {
                            iconContainer.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg group-hover:bg-black/30 transition-all duration-200">
                        {getFileTypeOverlayIcon(book)}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-slate-100 border-1 border-slate-300 flex items-center justify-center transition-all duration-200">
                      {getFileTypeOverlayIcon(book)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-slate-900 group-hover:text-slate-800 truncate">
                    Demo Book
                  </div>
                  <div className="text-xs text-slate-600 group-hover:text-slate-700 truncate">
                    Read free preview
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}


      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between py-2 px-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Demo Lecture
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div
              className="relative w-full"
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                src={selectedVideoUrl ? getYouTubeEmbedUrl(selectedVideoUrl) : ''}
                title="Demo Lecture"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

