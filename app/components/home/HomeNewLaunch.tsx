import type { HomeCourse } from '~/providers/home/types';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';

export default function HomeNewLaunch({
  heading,
  courses,
  viewAllHref,
}: {
  heading: string;
  courses: HomeCourse[];
  viewAllHref?: string;
}) {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 py-10 sm:py-12 border-y border-slate-200">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#1c212f]">
              {heading || 'New Launch'}
            </h2>
          </div>
          {viewAllHref && (
            <button
              type="button"
              onClick={() => navigate(viewAllHref)}
              className="inline-flex items-center justify-center rounded-full bg-[#4aaeed] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b9ddc] transition-colors shadow-sm"
            >
              View All
            </button>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {courses.map((course) => (
              <div
                key={course.id || course.slug}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => navigate(`/product/${course.slug}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {course.image ? (
                    <img
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      src={course.image + '?w=600&h=600'}
                      alt={course.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SparklesIcon className="h-12 w-12 text-blue-100" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      Latest
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-[15px] font-bold text-[#1c212f] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-extrabold text-[#1c212f]">
                        {course.offerPrice || course.price}
                      </span>
                      {course.offerPrice && course.price && (
                        <span className="text-xs font-medium text-slate-400 line-through">
                          {course.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state - placeholder cards */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse"
              >
                <div className="aspect-square bg-slate-50 rounded-xl mb-4" />
                <div className="h-4 bg-slate-50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-50 rounded w-1/2" />
              </div>
            ))}
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-sm font-medium">
                New launches are on their way! Stay tuned.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
