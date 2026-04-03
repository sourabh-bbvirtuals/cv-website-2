import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from './section-title';
import { sdk } from '~/graphqlWrapper';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';

interface Testimonial {
  name: string;
  message: string;
  imageUrl: string;
}

/** keep default sample data but renamed to avoid shadowing the prop */
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Hardik (Secured 85 in FM-SM)',
    message: '...',
    imageUrl: '/images/student-testimonial/student1.png',
  },
  // ... (your other sample items)
];

// /** fetch helper stays same */
// async function getTestimonials() {
//   try {
//     const response = await sdk.collection({ slug: 'desktop-banners' });
//     const { collection } = response;
//     if (!collection?.children) return [];
//     return collection.children.map((child: any) => ({
//       name: child.name,
//       message: child.description || '',
//       imageUrl:
//         child.customFields?.imageUrl ||
//         '/images/student-testimonial/student1.png',
//     }));
//   } catch (error) {
//     console.error('Error fetching testimonials:', error);
//     return [];
//   }
// }

const TestimonialsSection = ({
  testimonials: initialTestimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: Testimonial[];
}) => {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(initialTestimonials);
  const [currentPage, setCurrentPage] = useState(0);
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(6);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const ROTATION_INTERVAL = 2000;
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});

  // // load remote testimonials (if any)
  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     const data = await getTestimonials();
  //     if (mounted && data.length) {
  //       setTestimonials(data);
  //       setCurrentPage(0);
  //     }
  //   })();
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  // responsive layout: set per-page
  useEffect(() => {
    const updateTestimonialsPerPage = () => {
      if (window.innerWidth < 640) {
        setTestimonialsPerPage(1);
        setCurrentPage(0);
      } else if (window.innerWidth < 1024) {
        setTestimonialsPerPage(3);
        setCurrentPage(0);
      } else {
        setTestimonialsPerPage(6);
        setCurrentPage(0);
      }
      // clear expanded when layout changes
      setExpandedMap({});
    };

    updateTestimonialsPerPage();
    window.addEventListener('resize', updateTestimonialsPerPage);
    return () =>
      window.removeEventListener('resize', updateTestimonialsPerPage);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil((testimonials?.length || 0) / testimonialsPerPage),
  );

  // auto-rotation effect
  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }

    if (isAutoRotating && totalPages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        // collapse expanded items when rotating pages
        setExpandedMap({});
      }, ROTATION_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [isAutoRotating, totalPages, ROTATION_INTERVAL]);

  const pauseRotationTemporarily = (ms = 3000) => {
    setIsAutoRotating(false);
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(
      () => setIsAutoRotating(true),
      ms,
    );
  };

  const toggleExpand = (id: number) =>
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const start = currentPage * testimonialsPerPage;
  const end = (currentPage + 1) * testimonialsPerPage;
  const pageItems = testimonials.slice(start, end);

  return (
    <section className="bg-lightGray">
      <div className="max-w-7xl mx-auto relative py-8">
        <div className="text-center space-y-4 mb-8 px-3 sm:px-4">
          <h1 className="text-3xl font-bold">Our Students Love Us</h1>
          <p className="font-light">
            Our main focus is to make the learning experience as economical as
            possible for all students.
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-8"
              onMouseEnter={() => setIsAutoRotating(false)}
              onMouseLeave={() => setIsAutoRotating(true)}
            >
              {pageItems.map((testimonial, idx) => {
                const globalIndex = start + idx; // unique id per item
                const isLong = (testimonial.message?.length || 0) > 100;
                const isExpanded = Boolean(expandedMap[globalIndex]);

                return (
                  <div
                    key={`${testimonial.name}-${globalIndex}`}
                    className="bg-white p-6 rounded-xl shadow-sm"
                  >
                    <blockquote className="space-y-4">
                      <p className="text-sm md:text-base leading-relaxed text-gray-700">
                        {isExpanded || !isLong
                          ? testimonial.message
                          : testimonial.message.slice(0, 100) + '...'}
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(globalIndex)}
                            className="ml-2 text-black font-medium"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </p>
                      <footer className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </footer>
                    </blockquote>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4 mb-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i);
                setExpandedMap({});
                pauseRotationTemporarily(3000);
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentPage ? 'bg-indigo-600' : 'bg-gray-400'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
