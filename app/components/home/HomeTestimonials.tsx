import { useEffect, useRef, useState } from 'react';
import type { HomeTestimonial } from '~/providers/home/types';

export default function HomeTestimonials({
  heading = 'Testimonials',
  testimonials,
}: {
  heading: string;
  testimonials: HomeTestimonial[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const hasMultiple = testimonials.length > 1;

  const extendedTestimonials = hasMultiple
    ? [testimonials[testimonials.length - 1], ...testimonials, testimonials[0]]
    : testimonials;

  useEffect(() => {
    if (hasMultiple) {
      setCurrentIndex(1);
    } else {
      setCurrentIndex(0);
    }
  }, [hasMultiple, testimonials.length]);

  useEffect(() => {
    if (!hasMultiple || isPaused) return;

    const id = setInterval(() => {
      setWithTransition(true);
      setCurrentIndex((prev) => (prev + 1) % extendedTestimonials.length);
    }, 3000);

    return () => clearInterval(id);
  }, [hasMultiple, isPaused, extendedTestimonials.length]);

  const handleNext = () => {
    if (!hasMultiple) return;
    setWithTransition(true);
    setCurrentIndex((prev) => (prev + 1) % extendedTestimonials.length);
  };

  const handlePrev = () => {
    if (!hasMultiple) return;
    setWithTransition(true);
    setCurrentIndex(
      (prev) =>
        (prev - 1 + extendedTestimonials.length) % extendedTestimonials.length,
    );
  };

  const handleTransitionEnd = () => {
    if (!hasMultiple) return;

    if (currentIndex === extendedTestimonials.length - 1) {
      setWithTransition(false);
      setCurrentIndex(1);
      return;
    }

    if (currentIndex === 0) {
      setWithTransition(false);
      setCurrentIndex(extendedTestimonials.length - 2);
    }
  };

  useEffect(() => {
    if (!withTransition) {
      const id = requestAnimationFrame(() => {
        setWithTransition(true);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [withTransition]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setIsPaused(false);
      return;
    }

    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 40;

    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }

    setIsPaused(false);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const activeDotIndex = hasMultiple
    ? currentIndex === 0
      ? testimonials.length - 1
      : currentIndex === extendedTestimonials.length - 1
      ? 0
      : currentIndex - 1
    : 0;

  const goToTestimonial = (index: number) => {
    if (!hasMultiple) {
      setCurrentIndex(0);
      return;
    }
    setWithTransition(true);
    setCurrentIndex(index + 1);
  };

  return (
    <section className=" py-10 overflow-x-hidden">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c212f]">
            {heading}
          </h2>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-stretch px-4 py-6 sm:px-10 sm:py-10">
            {/* Stable image on the left */}
            <div className="hidden md:block">
              <div className="relative h-full min-h-[300px] lg:min-h-[400px] rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src="/assets/testimonial-card-ca.png"
                  alt="Student success stories"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Sliding testimonials on the right */}
            <div className="flex min-w-0 w-full flex-col justify-between">
              <div className="relative min-w-0 w-full">
                <div className="w-full min-w-0 overflow-hidden">
                  <div
                    className={`flex w-full min-w-0 flex-nowrap ${
                      withTransition
                        ? 'transition-transform duration-700 ease-in-out'
                        : ''
                    }`}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {extendedTestimonials.map((item, index) => (
                      <div
                        key={`${item.author}-${index}`}
                        className="basis-full shrink-0 grow-0 min-w-0 w-full max-w-full flex justify-center"
                      >
                        <div className="w-full box-border max-w-2xl mx-auto px-2 sm:px-0">
                          <div className="mb-3 text-center">
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#1c212f]">
                              {item.author}
                            </p>
                            <div className="w-12 h-0.5 bg-[#4aaeed] mt-2 mx-auto" />
                          </div>
                          <p className="text-sm sm:text-base text-[#8d8f95] mb-4 leading-relaxed break-words whitespace-normal text-center">
                            {item.text}
                          </p>
                          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-3 sm:justify-center">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.author}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                            )}
                            <div className="text-center">
                              {item.role && (
                                <p className="mt-1 text-xs text-[#414151] text-center break-words">
                                  {item.role}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {hasMultiple && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="flex gap-2">
                    {testimonials.map((item, index) => (
                      <button
                        key={`${item.author}-${index}-dot`}
                        type="button"
                        onClick={() => goToTestimonial(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === activeDotIndex
                            ? 'w-6 bg-[#4aaeed]'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
