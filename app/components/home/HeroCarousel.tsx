import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface HeroSlide {
  id: string;
  url: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  className?: string;
}

export function HeroCarousel({ slides, className = '' }: HeroCarouselProps) {
  if (!slides || slides.length === 0) return null;

  return (
    <section className={`relative group w-full ${className}`}>
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        className="hero-swiper w-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id || idx}>
            <div className="w-full relative aspect-[21/9] sm:aspect-[21/8] lg:aspect-[3/1] xl:aspect-[3.5/1] min-h-[80px] sm:min-h-[140px] lg:min-h-[150px] bg-slate-50">
              <img
                src={slide.url}
                alt={`Hero slide ${idx + 1}`}
                className="w-full h-full object-contain select-none"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      {slides.length > 1 && (
        <>
          <button
            className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white opacity-40 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-blue-600 shadow-lg cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white opacity-40 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-blue-600 shadow-lg cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </section>
  );
}
