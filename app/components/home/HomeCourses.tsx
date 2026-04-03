import type { HomeCourse } from '~/providers/home/types';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Helper function to calculate discount percentage
function calculateDiscount(
  originalPrice?: string,
  offerPrice?: string,
): number | null {
  try {
    const orig = parseFloat(originalPrice?.replace(/[^\d.]/g, '') || '0');
    const offer = parseFloat(offerPrice?.replace(/[^\d.]/g, '') || '0');
    if (orig > 0 && offer > 0 && orig > offer) {
      return Math.round(((orig - offer) / orig) * 100);
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

export default function HomeCourses({
  heading,
  courses,
  viewAllHref,
}: {
  heading: string;
  courses: HomeCourse[];
  viewAllHref?: string;
}) {
  const navigate = useNavigate();

  const getSafeViewAllHref = () => {
    const raw = String(viewAllHref || '').trim();
    const firstTitle = String(courses?.[0]?.title || '').toLowerCase();

    const inferredFromFirstCard = () => {
      if (
        firstTitle.includes('foundation') &&
        firstTitle.includes('quantitative')
      ) {
        return '/lectures/ca-found/quantitative-aptitude';
      }
      if (firstTitle.includes('inter') && firstTitle.includes('financial')) {
        return '/lectures/ca-inter/financial-management';
      }
      if (firstTitle.includes('final') && firstTitle.includes('financial')) {
        return '/lectures/ca-final/advanced-financial-management';
      }
      return '/lectures/ca-found/quantitative-aptitude';
    };

    if (!raw) return inferredFromFirstCard();
    if (/^\/faculty\/[^/]+\/courses\/?$/i.test(raw))
      return inferredFromFirstCard();
    if (raw === '/courses') return inferredFromFirstCard();
    return raw;
  };

  const safeViewAllHref = getSafeViewAllHref();

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c212f]">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-[#8d8f95]">
              Master CA exams with expert-designed courses
            </p>
          </div>
          {safeViewAllHref && (
            <button
              type="button"
              onClick={() => navigate(safeViewAllHref)}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#4aaeed] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3a9de0] transition-colors shadow-sm"
            >
              View all
              <ChevronRight className="h-4 w-4 text-white" aria-hidden="true" />
            </button>
          )}
        </div>
        {courses.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {courses.map((course) => {
                const discount = calculateDiscount(
                  course.price,
                  course.offerPrice,
                );

                return (
                  <div
                    key={course.id || course.slug}
                    className="group cursor-pointer h-full flex flex-col w-full max-w-[260px] lg:max-w-[280px]"
                    onClick={() => navigate(`/product/${course.slug}`)}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm group-hover:shadow-md transition-all">
                      <img
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        src="/assets/course-card.png"
                        alt={course.title}
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Badge Section */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {discount !== null && discount > 0 && (
                          <div className="rounded-full bg-red-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
                            -{discount}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-bold text-[#1c212f] leading-snug line-clamp-2 group-hover:text-[#4aaeed] transition-colors">
                        {course.title}
                      </h3>

                      {/* Pricing */}
                      {(course.price || course.offerPrice) && (
                        <div className="mt-2 flex items-baseline gap-2">
                          {course.offerPrice ? (
                            <>
                              <span className="text-base font-bold text-[#4aaeed]">
                                {course.offerPrice}
                              </span>
                              {course.price && (
                                <span className="text-xs font-medium text-[#8d8f95] line-through">
                                  {course.price}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-base font-bold text-[#1c212f]">
                              {course.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {safeViewAllHref && (
              <div className="mt-8 sm:hidden flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate(safeViewAllHref)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#1c212f] hover:bg-slate-100 transition-colors shadow-sm w-full"
                >
                  View all courses
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state - placeholder cards */
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="w-full aspect-[5/4] bg-gray-200 rounded-lg" />
                <div className="mt-3 space-y-2 flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
            <div className="col-span-full text-center py-8">
              <p className="text-[#8d8f95] text-sm">
                Courses coming soon! Check back shortly for courses.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
