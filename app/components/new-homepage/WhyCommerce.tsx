import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SliderArrow } from './Icons';

// TypeScript Interface for Features
interface FeatureCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
}

// Data Array with Dummy Images for the UI mockups
const featuresData: FeatureCard[] = [
  {
    id: 1,
    title: 'HD Video Lectures',
    description:
      'Watch free videos by top educators. Earn 10 coins per completed lecture. No account needed to start.',
    imageUrl: 'https://placehold.co/600x400/e2e8f0/64748b?text=Video+Player+UI',
    bgColor: 'bg-[#f4f7ff]',
  },
  {
    id: 2,
    title: 'Board-Specific notes',
    description:
      'Earn coins watching videos, solving quizzes, attending live classes.',
    imageUrl: 'https://placehold.co/600x400/e0f2fe/0369a1?text=Notes+List+UI',
    bgColor: 'bg-[#f0fdfa]',
  },
  {
    id: 3,
    title: 'Live Doubt sessions',
    description:
      'Weekly live classes with teachers. Ask doubts in real time. All sessions recorded and available for replay.',
    imageUrl: 'https://placehold.co/600x400/ffe4e6/be123c?text=Doubt+Chat+UI',
    bgColor: 'bg-[#fff1f2]',
  },
  {
    id: 4,
    title: 'DPP & Mock Tests',
    description:
      'Daily Full-length mock tests and chapter-wise practice papers with detailed solutions.',
    imageUrl: 'https://placehold.co/600x400/f3e8ff/7e22ce?text=Mock+Test+UI',
    bgColor: 'bg-[#faf5ff]',
  },
  {
    id: 5,
    title: 'Board-Specific notes',
    description:
      'Earn coins watching videos, solving quizzes, attending live classes.',
    imageUrl: 'https://placehold.co/600x400/e0f2fe/0369a1?text=Notes+List+UI',
    bgColor: 'bg-[#f0fdfa]',
  },
];

const WhyCommerce: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    // Section pe overflow-hidden rakhna zaroori hai taaki right scrollbar na aaye
    <section className="py-12 lg:py-16 min-[1600px]:py-25! overflow-hidden">
      {/* Yahan se overflow-hidden HATA DIYA HAI taaki right me bleed kare */}
      <div className="custom-container">
        {/* Header Section */}
        <div className="flex max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:gap-4 justify-between items-end mb-8 sm:mb-10 md:mb-16">
          <div className="text-left max-sm:text-center">
            <p className="text-sm sm:text-base font-semibold text-gray-500 mb-2 uppercase tracking-wide md:mb-4">
              Feature highlights
            </p>
            <h2 className="section-heading font-bold text-[#081627] max-w-4xl leading-tight">
              Study smarter with tools built for commerce prep
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 relative z-10">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="size-12 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer"
              aria-label="Previous"
            >
              <SliderArrow />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="size-12 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer rotate-180"
              aria-label="Next"
            >
              <SliderArrow />
            </button>
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={48}
            slidesPerView={1}
            loop={true}
            speed={600}
            breakpoints={{
              480: { slidesPerView: 1.5 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3 },
            }}
            // !overflow-visible ensure karega ki cut na ho right se
            className="w-full !overflow-visible"
          >
            {featuresData.map((feature) => (
              <SwiperSlide key={feature.id}>
                <div className="flex flex-col text-left group cursor-pointer">
                  {/* Colored Image Box */}
                  <div
                    className={`relative w-full aspect-[4/4] sm:aspect-[4/4.5] rounded-[2rem] ${feature.bgColor} mb-6 xl:mb-12 min-[1600px]:mb-16! flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 p-6`}
                  >
                    <img
                      src={feature.imageUrl}
                      alt={feature.title}
                      className="w-full h-auto object-contain rounded-xl drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Text Content */}
                  <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-[#081627] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base xl:text-xl text-[#081627] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default WhyCommerce;
