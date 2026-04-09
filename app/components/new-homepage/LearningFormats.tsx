import { Maximize2, Play, Volume2 } from 'lucide-react';
import React, { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SliderArrow } from './Icons';

/** Figma MCP assets (match file design) */
const imgVideoThumb =
  'https://www.figma.com/api/mcp/asset/ff0d89f7-675b-47f6-86bb-1169c7040199';
const imgPlay =
  'https://www.figma.com/api/mcp/asset/acfa0401-0ac4-4e17-85da-7e06ab7ac0cc';
const imgDocIcon =
  'https://www.figma.com/api/mcp/asset/7386afa6-f7e3-401a-ace1-1a0ddb7384c6';
const imgAvatar =
  'https://www.figma.com/api/mcp/asset/3abd4ca3-7ed6-456a-aae7-e3183d6f5391';
const notesRows = [
  { title: 'CBSE Class 11th Notes', subtitle: '240+ PDFs' },
  { title: 'MH Class 11th Notes', subtitle: '120+ PDFs' },
  { title: 'CBSE Class 12th Notes', subtitle: '240+ PDFs' },
  { title: 'MH Class 12th Notes', subtitle: '240+ PDFs' },
  { title: 'CUET Mock Tests', subtitle: '240+ PDFs' },
];

const LearningFormats: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const CARD_WIDTH = 420; // Fixed card width in pixels

  const cards = [
    {
      id: 'video',
      title: 'HD Video Lectures',
      desc: 'Watch free videos by top educators. Earn 10 coins per completed lecture. No account needed to start.',
      wrapperClass: 'bg-[#eef2ff]',
      borderClass: 'border-[#d8e0f9]',
      img: '/assets/images/LearningFormats/video-lecture.png',
    },
    {
      id: 'notes',
      title: 'Board-Specific Notes',
      desc: 'Earn coins watching videos, solving quizzes, attending live classes.',
      wrapperClass: 'bg-[#eefaff]',
      borderClass: 'border-[#cfedfa]',
      img: '/assets/images/LearningFormats/board-notes.png',
    },
    {
      id: 'doubt',
      title: 'Live Doubt Sessions',
      desc: 'Weekly live classes with teachers. Ask doubts in real time. All sessions recorded and available for replay.',
      wrapperClass: 'bg-[#fff1ee]',
      borderClass: 'border-[#f5dbd6]',
      img: '/assets/images/LearningFormats/mock-tests.png',
    },
    {
      id: 'mock',
      title: 'DPPs & mock tests',
      desc: 'Daily practice problems matching exam patterns. Full-length mocks with detailed guide.',
      wrapperClass: 'bg-[#f0f9ff]',
      borderClass: 'border-[#d0e8ff]',
      img: '/assets/images/LearningFormats/doubt-session.png',
    },
  ];

  return (
    <section className="bg-white overflow-hidden">
      <div className="custom-container">
        <div className="flex max-sm:flex-col max-sm:items-center max-sm:text-center max-sm:gap-2 justify-between items-end mb-8 sm:mb-10 md:mb-16 gap-6">
          <div className="text-left max-sm:text-center max-w-190 4xl:max-w-183.75! flex flex-col text-lightgray">
            <p className="text-base md:text-lg sm:text-xl font-medium text-lightgray mb-2 md:mb-5 leading-[120%]">
              Why Commerce Virtual
            </p>
            <h2 className="section-heading text-lightgray">
              Everything a Commerce Student Actually Needs.
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
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
        {/* Mobile Grid View */}
        <div className="sm:hidden grid grid-cols-1 gap-6 mb-8 p-2">
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col gap-4">
              {card.img && (
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-contain"
                />
              )}
              <div className="flex flex-col gap-3 text-lightgray px-1">
                <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-900 font-normal leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Carousel View */}
        <div className="hidden sm:block relative">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={80}
            slidesPerView={3}
            speed={600}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1280: { slidesPerView: 3 },
            }}
            className="w-full overflow-visible!"
          >
            {cards.map((card) => (
              <SwiperSlide key={card.id} className="h-auto!">
                <div
                  className="flex flex-col gap-6 h-full"
                  style={{ width: `${CARD_WIDTH}px` }}
                >
                  {/* img */}
                  {card.img && (
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-contain"
                    />
                  )}

                  <div className="flex flex-col gap-3 text-lightgray px-1">
                    <h3 className="text-2xl font-semibold text-gray-900 leading-tight mt-6">
                      {card.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-900 font-normal leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default LearningFormats;
