import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SliderArrow } from './Icons';
import { useBoardSelection } from '~/context/BoardSelectionContext';
import { FACULTIES_BY_BOARD } from './FacultySection';

export interface TeamMember {
  name: string;
  designation: string;
  experience: string;
  image: string;
}

export interface TeamSectionProps {
  title: string;
  members: TeamMember[];
  boardFaculties?: Record<string, TeamMember[]>;
  hasExplicitBoard?: boolean;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  title,
  members,
  boardFaculties,
  hasExplicitBoard,
}) => {
  const { selectedSlug, boardOptions } = useBoardSelection();
  const selectedBoard = boardOptions.find((o) => o.slug === selectedSlug);
  const boardKey = hasExplicitBoard
    ? selectedBoard?.board.toLowerCase() || ''
    : '';

  const allBoardFaculties = boardFaculties
    ? Object.values(boardFaculties).flat().filter(Boolean)
    : [];
  const allFallbackFaculties = Object.values(FACULTIES_BY_BOARD).flat();

  const vendureBoardMembers = boardKey ? boardFaculties?.[boardKey] : null;
  const faculties =
    vendureBoardMembers && vendureBoardMembers.length > 0
      ? vendureBoardMembers
      : boardKey && FACULTIES_BY_BOARD[boardKey]?.length > 0
      ? FACULTIES_BY_BOARD[boardKey]
      : allBoardFaculties.length > 0
      ? allBoardFaculties
      : members.length > 0
      ? members
      : allFallbackFaculties;

  const uniqueFaculties = faculties.filter(
    (f, i, arr) => arr.findIndex((x) => x.name === f.name) === i,
  );
  const swiperRef = useRef<SwiperType | null>(null);

  // if (!members || members.length === 0) return null;

  return (
    <section id="our-team" className="scroll-mt-32 overflow-hidden">
      <div className="custom-container">
        <div className="flex max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:gap-4 justify-between items-end gap-4 mb-2 sm:mb-12 md:mb-16">
          <div className="text-left max-sm:text-center">
            <p className="text-base md:text-lg sm:text-xl font-medium text-lightgray mb-2 md:mb-5 leading-[120%]">
              Our Team
            </p>
            <h2 className="section-heading text-lightgray">
              {'They are best at what they do'}
            </h2>
          </div>

          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="size-8 sm:size-12 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer"
              aria-label="Previous"
            >
              <SliderArrow />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="size-8 sm:size-12 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer rotate-180"
              aria-label="Next"
            >
              <SliderArrow />
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden mb-10 sm:mb-0">
          <Swiper
            modules={[Autoplay]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            loop
            speed={550}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={8}
            slidesPerView={2}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 8 },
              640: { slidesPerView: 2.6, spaceBetween: 18 },
              768: { slidesPerView: 2.6, spaceBetween: 26 },
              1024: { slidesPerView: 3.2, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 36 },
            }}
            className="w-full"
          >
            {uniqueFaculties.map((member, index) => (
              <SwiperSlide key={index}>
                <article
                  className={`group flex flex-col items-center px-0.5 text-center ${
                    index % 2 !== 0 ? 'mt-0 md:mt-17.75' : 'mt-0'
                  }`}
                >
                  <div className="relative mb-3 sm:mb-5 flex w-36 h-36 md:w-70 md:h-77">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3
                      className="text-sm sm:text-2xl font-medium leading-snug tracking-tight text-lightgray"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {member.name}
                    </h3>
                    <p className="text-sm md:text-base font-normal leading-[120%] text-lightgray/60 sm:text-base">
                      {member.designation}
                    </p>
                    {member.experience && (
                      <span className="inline-flex items-center justify-center rounded-[40px] border border-[#0816271A] bg-[#0816270D] px-1.5 py-0.5 sm:px-2 sm:py-1 text-sm sm:text-base leading-[1.2] font-medium text-[#08162780] whitespace-nowrap">
                        {member.experience}
                      </span>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex sm:hidden justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="size-8 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer"
            aria-label="Previous"
          >
            <SliderArrow />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="size-8 flex items-center justify-center rounded-[42px] bg-[rgba(8,22,39,0.03)] duration-300 hover:bg-[rgba(8,22,39,0.06)] cursor-pointer rotate-180"
            aria-label="Next"
          >
            <SliderArrow />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
