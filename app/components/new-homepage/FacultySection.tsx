import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SliderArrow } from './Icons';
import { useBoardSelection } from '~/context/BoardSelectionContext';

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  experience: string;
  image: string;
}

interface FacultySectionProps {
  title?: string;
}

// data mapped to boards
export const FACULTIES_BY_BOARD: Record<string, Faculty[]> = {
  mh: [
    {
      id: '1',
      name: 'CA Ankita Sanghavi',
      designation: 'CA, AIR 27',
      experience: '5+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/b8/ca-ankita-sanghvi__preview.png',
    },
    {
      id: '2',
      name: 'CA Ashish Medicala',
      designation: 'CA',
      experience: '10+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/6c/ca-ashish-medicala__preview.png',
    },
    {
      id: '3',
      name: 'CA Bhushan Gosal',
      designation: 'CA, MCom',
      experience: '15+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/50/ca-bhushal-gosar__preview.png',
    },
    {
      id: '4',
      name: 'CA Mayur Sanghavi',
      designation: 'FCA, CFA, FRM, Rank 1 CA Finals',
      experience: '10+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/87/ca-mayur-sanghvi__preview.png',
    },
    {
      id: '5',
      name: 'CA Payal Sanghavi',
      designation: 'CA, CFA III',
      experience: '5+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/96/ca-payal-sanghvi__preview.png',
    },
    {
      id: '6',
      name: 'Pratik Mahajan',
      designation: 'Maths Specialist',
      experience: '4+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/ce/pratik-mahajan__preview.png',
    },
    {
      id: '7',
      name: 'CA Roshni Manral',
      designation: 'CA',
      experience: '5+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/0d/ca-roshni-manral__preview.png',
    },
    {
      id: '8',
      name: 'CA Shubham Sanghavi',

      designation: 'CA, CFA, State Topper SSC&HSC',
      experience: '14+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/bc/ca-shubham-sanghvi__preview.png',
    },
    {
      id: '9',
      name: 'Sanjay Appan',
      designation: 'OCM',
      experience: '10+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/77/sanjay-appan__preview.png',
    },
  ],
  cbse: [
    {
      id: '1',
      name: 'CA Aditya Agarwal',
      designation: 'CA',
      experience: '15+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/52/ca-aditya-agarwal__preview.png',
    },
    {
      id: '2',
      name: 'Aman Mehta',
      designation: 'Master in Commerce',
      experience: '14+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/bf/aman-mehta__preview.png',
    },
    {
      id: '3',
      name: 'Ashish Sunil',
      designation: 'CMA Finalist, MBA Finance',
      experience: '4+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/34/ashish-sunil__preview.png',
    },
    {
      id: '4',
      name: 'Ekta Gutgutia ',
      designation: 'Master’s in Commerce, B.ed',
      experience: '6+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/e0/ekta-gutgutia__preview.png',
    },
    {
      id: '5',
      name: 'Himanshu Arora',
      designation: '​UGC NET | M.Com | MBA | B.Ed | PGDIB',
      experience: '15+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/81/himanshu-arora__preview.png',
    },
    {
      id: '6',
      name: 'Kirti Tripathi ',
      designation: 'Master’s in Arts ',
      experience: '12+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/23/kirti-tripathi__preview.png',
    },
    {
      id: '7',
      name: 'Mahak Gandhi',
      designation: 'CA Finalist',
      experience: '1 Year Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/8f/mahak-gandhi__preview.png',
    },
  ],
  cuet: [
    {
      id: '1',
      name: 'Mahak Gandhi',
      designation: 'CA Finalist',
      experience: '1 Year Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/8f/mahak-gandhi__preview.png',
    },
    {
      id: '2',
      name: 'Aman Mehta',
      designation: 'Master in Commerce',
      experience: '14+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/bf/aman-mehta__preview.png',
    },
    {
      id: '3',
      name: 'Ashish Sunil',
      designation: 'CMA Finalist, MBA Finance',
      experience: '4+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/34/ashish-sunil__preview.png',
    },
    {
      id: '4',
      name: 'Kirti Tripathi ',
      designation: 'Master’s in Arts ',
      experience: '12+ Years Experience',
      image:
        'https://bbvendure.appwallah.com/assets/preview/23/kirti-tripathi__preview.png',
    },
  ],
};

const FacultySection: React.FC<FacultySectionProps> = ({
  title = 'Expert Faculty',
}) => {
  const { selectedSlug, boardOptions } = useBoardSelection();
  const swiperRef = useRef<SwiperType | null>(null);

  // Find the board name from slug
  const selectedBoard = boardOptions.find((o) => o.slug === selectedSlug);
  const boardKey = selectedBoard?.board.toLowerCase() || 'mh';
  console.log('Selected Board:', selectedBoard?.board, 'Board Key:', boardKey);

  const faculties = FACULTIES_BY_BOARD[boardKey] || FACULTIES_BY_BOARD.mh;

  if (!faculties || faculties.length === 0) return null;

  return (
    <section className="overflow-hidden">
      <div className="custom-container">
        <div className="flex max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:gap-4 justify-between items-end gap-4 mb-2 sm:mb-12 md:mb-16">
          <div className="text-left max-sm:text-center">
            <p className="text-base md:text-lg sm:text-xl font-medium text-lightgray mb-2 md:mb-5 leading-[120%]">
              Our Faculty
            </p>
            <h2 className="section-heading text-lightgray">{title}</h2>
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
            {faculties.map((faculty, index) => (
              <SwiperSlide key={faculty.id}>
                <article
                  className={`group flex flex-col items-center px-0.5 text-center ${
                    index % 2 !== 0 ? 'mt-0 md:mt-17.75' : 'mt-0'
                  }`}
                >
                  <div className="relative mb-3 sm:mb-5 flex w-36 h-36 md:w-70 md:h-77">
                    <img
                      src={faculty.image}
                      alt={faculty.name}
                      loading="lazy"
                      className="w-full h-full object-contain object-bottom"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3
                      className="text-sm sm:text-2xl font-medium leading-snug tracking-tight text-lightgray"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {faculty.name}
                    </h3>
                    <p className="text-sm md:text-base font-normal leading-[120%] text-lightgray/60 sm:text-base">
                      {faculty.designation}
                    </p>
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

export default FacultySection;
