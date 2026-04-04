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
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#d8e0f9] rounded-[20px] p-4 w-full flex flex-col h-80 overflow-hidden">
          <div className="flex-1 min-h-0 rounded-[12px] overflow-hidden relative bg-lightgray">
            <div className="absolute inset-0 opacity-80">
              <img
                src={imgVideoThumb}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
            <button
              type="button"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-[4.688px] bg-[rgba(8,22,39,0.1)] border-[0.893px] border-white rounded-full size-8 flex items-center justify-center"
              aria-label="Play"
            >
              <img src={imgPlay} alt="" className="size-5 object-contain" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 pt-6 px-4 pb-4 flex flex-col gap-2">
              <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.2)] w-full overflow-hidden">
                <div className="bg-[#fb2c36] h-[3px] rounded-full w-[4%]" />
              </div>
              <div className="flex items-center justify-between text-[rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3 text-[11px] leading-[16.5px]">
                  <Play className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span className="tabular-nums font-['Geist',sans-serif]">
                    0:00 / 54:05
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-[rgba(255,255,255,0.1)] rounded px-1.5 py-0.5 text-[rgba(255,255,255,0.6)] leading-[15px]">
                    1x
                  </span>
                  <Maximize2 className="w-4 h-4 opacity-80 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      title: 'Board-Specific Notes',
      desc: 'Get structured notes for each board and exam target with quick revision support.',
      wrapperClass: 'bg-[#eefaff]',
      borderClass: 'border-[#cfedfa]',
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#cfedfa] rounded-[20px] p-4 w-full flex flex-col gap-3 sm:gap-5 h-80 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {notesRows.map((row) => (
            <div
              key={row.title}
              className="flex gap-3 sm:gap-4 items-center w-full shrink-0"
            >
              <div className="bg-[rgba(8,22,39,0.03)] rounded-xl size-10 sm:size-16 shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={imgDocIcon}
                  alt=""
                  className="size-6 sm:size-8 object-contain"
                />
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 min-w-0 text-lightgray">
                <p className="font-medium text-base sm:text-xl leading-[120%] truncate">
                  {row.title}
                </p>
                <p className="text-sm font-normal leading-[150%]">
                  {row.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'doubt',
      title: 'Live Doubt Sessions',
      desc: 'Weekly live classes with teachers. Ask doubts in real time and replay recordings anytime.',
      wrapperClass: 'bg-[#fff1ee]',
      borderClass: 'border-[#f5dbd6]',
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#f5dbd6] rounded-[20px] p-4 w-full flex flex-col gap-3 sm:gap-5 h-80">
          <div className="border-b border-[rgba(8,22,39,0.1)] pb-3 sm:pb-5 flex flex-col gap-1 sm:gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center">
                <span className="text-[11px] font-medium tracking-[1px] text-lightgray/50 uppercase">
                  ACCOUNTING
                </span>
                <span className="size-1 rounded-full bg-lightgray/30" />
                <span className="text-[11px] font-medium tracking-[1px] text-lightgray/50 uppercase">
                  SHARES
                </span>
              </div>
              <p className="font-medium text-sm sm:text-base text-lightgray leading-[150%]">
                I&apos;m confused - when shares are forfeited, where does the
                amount already received go?
              </p>
            </div>
            <p className="font-medium text-sm sm:text-base text-lightgray/50 leading-[120%]">
              Swastik Sharma
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <div className="border border-[#e8f1fc] rounded-[36px] size-9.5 shrink-0 overflow-hidden">
              <img
                src={imgAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2.5 min-w-0 flex-1">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-medium text-base sm:text-xl text-lightgray leading-[120%]">
                  Abhishek Bajaj
                </span>
                <span className="size-0.75 rounded-full bg-lightgray/30 shrink-0" />
                <span className="text-xs text-lightgray/30 leading-[1.2]">
                  1h ago
                </span>
              </div>
              <p className="text-sm sm:text-base font-normal text-lightgray leading-[150%]">
                The amount already received on forfeited shares is transferred
                to the Share Forfeiture Account.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'video',
      title: 'HD Video Lectures',
      desc: 'Watch free videos by top educators. Earn 10 coins per completed lecture. No account needed to start.',
      wrapperClass: 'bg-[#eef2ff]',
      borderClass: 'border-[#d8e0f9]',
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#d8e0f9] rounded-[20px] p-4 w-full flex flex-col h-80 overflow-hidden">
          <div className="flex-1 min-h-0 rounded-[12px] overflow-hidden relative bg-lightgray">
            <div className="absolute inset-0 opacity-80">
              <img
                src={imgVideoThumb}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
            <button
              type="button"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-[4.688px] bg-[rgba(8,22,39,0.1)] border-[0.893px] border-white rounded-full size-8 flex items-center justify-center"
              aria-label="Play"
            >
              <img src={imgPlay} alt="" className="size-5 object-contain" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 pt-6 px-4 pb-4 flex flex-col gap-2">
              <div className="h-[3px] rounded-full bg-[rgba(255,255,255,0.2)] w-full overflow-hidden">
                <div className="bg-[#fb2c36] h-[3px] rounded-full w-[4%]" />
              </div>
              <div className="flex items-center justify-between text-[rgba(255,255,255,0.8)]">
                <div className="flex items-center gap-3 text-[11px] leading-[16.5px]">
                  <Play className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span className="tabular-nums font-['Geist',sans-serif]">
                    0:00 / 54:05
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-[rgba(255,255,255,0.1)] rounded px-1.5 py-0.5 text-[rgba(255,255,255,0.6)] leading-[15px]">
                    1x
                  </span>
                  <Maximize2 className="w-4 h-4 opacity-80 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      title: 'Board-Specific Notes',
      desc: 'Get structured notes for each board and exam target with quick revision support.',
      wrapperClass: 'bg-[#eefaff]',
      borderClass: 'border-[#cfedfa]',
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#cfedfa] rounded-[20px] p-4 w-full flex flex-col gap-5 h-80 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {notesRows.map((row) => (
            <div
              key={row.title}
              className="flex gap-3 sm:gap-4 items-center w-full shrink-0"
            >
              <div className="bg-[rgba(8,22,39,0.03)] rounded-xl size-10 sm:size-16 shrink-0 overflow-hidden flex items-center justify-center">
                <img
                  src={imgDocIcon}
                  alt=""
                  className="size-6 sm:size-8 object-contain"
                />
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 min-w-0 text-lightgray">
                <p className="font-medium text-base sm:text-xl leading-[120%] truncate">
                  {row.title}
                </p>
                <p className="text-sm font-normal leading-[150%]">
                  {row.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'doubt',
      title: 'Live Doubt Sessions',
      desc: 'Weekly live classes with teachers. Ask doubts in real time and replay recordings anytime.',
      wrapperClass: 'bg-[#fff1ee]',
      borderClass: 'border-[#f5dbd6]',
      content: (
        <div className="backdrop-blur-[17px] bg-[rgba(255,255,255,0.8)] border border-[#f5dbd6] rounded-[20px] p-4 w-full flex flex-col gap-3 sm:gap-5 h-80">
          <div className="border-b border-[rgba(8,22,39,0.1)] pb-3 sm:pb-5 flex flex-col gap-1 sm:gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-center">
                <span className="text-[11px] font-medium tracking-[1px] text-lightgray/50 uppercase">
                  ACCOUNTING
                </span>
                <span className="size-1 rounded-full bg-lightgray/30" />
                <span className="text-[11px] font-medium tracking-[1px] text-lightgray/50 uppercase">
                  SHARES
                </span>
              </div>
              <p className="font-medium text-sm sm:text-base text-lightgray leading-[150%]">
                I&apos;m confused - when shares are forfeited, where does the
                amount already received go?
              </p>
            </div>
            <p className="font-medium text-sm sm:text-base text-lightgray/50 leading-[120%]">
              Swastik Sharma
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <div className="border border-[#e8f1fc] rounded-[36px] size-9.5 shrink-0 overflow-hidden">
              <img
                src={imgAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2.5 min-w-0 flex-1">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="font-medium text-base sm:text-xl text-lightgray leading-[120%]">
                  Abhishek Bajaj
                </span>
                <span className="size-0.75 rounded-full bg-lightgray/30 shrink-0" />
                <span className="text-xs text-lightgray/30 leading-[1.2]">
                  1h ago
                </span>
              </div>
              <p className="text-sm sm:text-base font-normal text-lightgray leading-[150%]">
                The amount already received on forfeited shares is transferred
                to the Share Forfeiture Account.
              </p>
            </div>
          </div>
        </div>
      ),
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
            <h2 className="section-heading text-2xl md:text-5xl text-lightgray">
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
          {cards.slice(0, 3).map((card) => (
            <div key={card.id} className="flex flex-col gap-4">
              <div
                className={`${card.wrapperClass} rounded-3xl overflow-hidden relative flex items-center justify-center p-4 min-h-64 flex-shrink-0`}
              >
                {card.content}
              </div>
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
                  <div
                    className={`${card.wrapperClass} rounded-3xl overflow-hidden relative flex items-center justify-center p-4 min-h-72 flex-shrink-0`}
                  >
                    {card.content}
                  </div>
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
