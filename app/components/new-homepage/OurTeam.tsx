import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { SliderArrow } from './Icons';

interface TeamMember {
  id: number;
  name: string;
  qualification: string;
  experience: string;
  imageUrl: string;
}

/** Public assets — order matches Figma-style carousel (1→4 left to right) */
const teamData: TeamMember[] = [
  {
    id: 1,
    name: 'CA Ankita Sanghvi',
    qualification: 'CA, AIR 27',
    experience: '5+ Years Experience',
    imageUrl: '/assets/images/homepage/card-1.png',
  },
  {
    id: 2,
    name: 'CA Ashish Medicala',
    qualification: 'CA',
    experience: '10+ Years Experience',
    imageUrl: '/assets/images/homepage/card-2.png',
  },
  {
    id: 3,
    name: 'CA Bhushal Gosar',
    qualification: 'CA, MCom',
    experience: '15+ Years Experience',
    imageUrl: '/assets/images/homepage/card-1.png',
  },
  {
    id: 4,
    name: 'CA Mayur Sanghvi',
    qualification: 'FCA, CFA, FRM, Rank 1 CA Finals',
    experience: '10+ Years Experience',
    imageUrl: '/assets/images/homepage/card-4.png',
  },
  {
    id: 5,
    name: 'CA Payal Sanghvi',
    qualification: 'CA, CFA III',
    experience: '5+ Years Experience',
    imageUrl: '/assets/images/homepage/card-1.png',
  },
  {
    id: 6,
    name: 'Pratik Mahajan',
    qualification: 'Maths Specialist',
    experience: '4+ Years Experience',
    imageUrl: '/assets/images/homepage/card-2.png',
  },
  {
    id: 7,
    name: 'CA Roshni Manral',
    qualification: 'CA',
    experience: '5+ Years Experience',
    imageUrl: '/assets/images/homepage/card-4.png',
  },
  {
    id: 8,
    name: 'CA Shubham Sanghvi',
    qualification: 'CA, CFA, State Topper SSC&HSC',
    experience: '14+ Years Experience',
    imageUrl: '/assets/images/homepage/card-4.png',
  },
];

const OurTeam: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="overflow-hidden">
      <div className="custom-container">
        <div className="flex max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:gap-4 justify-between items-end gap-4 mb-8 sm:mb-12 md:mb-16">
          <div className="text-left max-sm:text-center">
            <p className="text-base md:text-lg sm:text-xl font-medium text-lightgray mb-2 md:mb-5 leading-[120%]">
              Our Team
            </p>
            <h2 className="section-heading text-lightgray">
              They are best at what they do
            </h2>
          </div>

          <div className="flex gap-2 shrink-0">
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

        <div className="w-full overflow-hidden">
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
            spaceBetween={0}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 0 },
              640: { slidesPerView: 2.6, spaceBetween: 18 },
              768: { slidesPerView: 2.6, spaceBetween: 26 },
              1024: { slidesPerView: 3.2, spaceBetween: 30 },
              1280: { slidesPerView: 4, spaceBetween: 36 },
            }}
            className="w-full"
          >
            {teamData.map((member) => (
              <SwiperSlide key={member.id}>
                <article
                  className={`group flex flex-col items-center px-1 text-center ${
                    member.id % 2 === 0 ? 'mt-0 md:mt-17.75' : 'mt-0'
                  }`}
                >
                  <div className="relative mb-3 sm:mb-5 flex w-36 h-36 md:w-70 md:h-77">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-contain object-bottom"
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
                      {member.qualification}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-[40px] border border-[#0816271A] bg-[#0816270D] px-1.5 py-0.5 sm:px-2 sm:py-1 text-sm sm:text-base leading-[1.2] font-medium text-[#08162780] whitespace-nowrap">
                      {member.experience}
                    </span>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
