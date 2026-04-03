import { useState } from 'react';

interface CourseIntroProps {
  heading?: string;
  intro?: string;
}

export function CourseIntro({ 
  heading,
  intro,
}: CourseIntroProps) {
  const [isIntroExpanded, setIsIntroExpanded] = useState<boolean>(false);
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="text-center space-y-6">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
              {heading}
            </h1>
            
            {/* {designation && (
              <div className="flex items-center justify-center gap-2">
                <Award size={20} className="text-indigo-600" />
                <span className="text-lg text-slate-600 font-medium">designation</span>
              </div>
            )} */}
          </div>

          {/* Intro */}
          {intro && (
            <div className="flex items-center justify-center">
              <div className="">
                <p className={`mt-3 sm:mt-4 text-sm sm:text-[15px] leading-6 sm:leading-7 text-slate-600 ${
                  !isIntroExpanded ? 'line-clamp-4 sm:line-clamp-none' : ''
                }`}>
                  {intro}
                </p>
                {intro && intro.length > 200 && (
                  <button
                    onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium sm:hidden"
                  >
                    {isIntroExpanded ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
