import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';
import React, { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CourseCard } from './CourseCard';
import { useBoardSelection } from '~/context/BoardSelectionContext';

export type FeaturedCourse = {
  id: string;
  title: string;
  slug?: string;
  meta: string[];
  enrolled: string;
  image: string;
  badge?: string;
  starts: string;
  ends: string;
  price: string;
  wasPrice: string;
  language?: string;
  type?: string;
};

const fallbackCourses: FeaturedCourse[] = [
  {
    id: '1',
    title: 'Class 11 Commerce Complete Batch 2025',
    meta: ['Business Studies', 'English', 'CA Ashish'],
    enrolled: '1240 Students Enrolled',
    image:
      'https://www.figma.com/api/mcp/asset/4dce5674-3071-4998-a233-86e915e354f1',
    badge: "Student's Favourite",
    starts: '10 May, 2026',
    ends: '10 May, 2027',
    price: '₹14,200',
    wasPrice: '₹25,500',
    language: 'Hindi',
    type: 'Live',
  },
  {
    id: '2',
    title: 'CA Foundation — All Subjects Live',
    meta: ['Accounts', 'Law', 'May 2026'],
    enrolled: '890 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    badge: 'Bestseller',
    starts: '12 May, 2026',
    ends: '15 Nov, 2026',
    price: '₹24,499',
    wasPrice: '₹32,999',
    language: 'Hinglish',
    type: 'Recorded',
  },
  {
    id: '3',
    title: 'Class 12 Commerce — Boards + CUET',
    meta: ['CBSE', 'Economics', 'CA Mayur Sanghvi'],
    enrolled: '2100 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    starts: '05 May, 2026',
    ends: '28 Feb, 2027',
    price: '₹16,999',
    wasPrice: '₹22,000',
    language: 'Hindi',
    type: 'Live',
  },
  {
    id: '2',
    title: 'CA Foundation — All Subjects Live',
    meta: ['Accounts', 'Law', 'May 2026'],
    enrolled: '890 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    badge: 'Bestseller',
    starts: '12 May, 2026',
    ends: '15 Nov, 2026',
    price: '₹24,499',
    wasPrice: '₹32,999',
    language: 'Hinglish',
    type: 'Recorded',
  },
  {
    id: '4',
    title: 'CUET Commerce — Section II & III',
    meta: ['Mock tests', 'PYQs', 'General Test'],
    enrolled: '560 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    starts: '01 Jun, 2026',
    ends: '30 Jun, 2026',
    price: '₹7,499',
    wasPrice: '₹9,999',
    language: 'Hindi',
    type: 'Live',
  },
  {
    id: '2',
    title: 'CA Foundation — All Subjects Live',
    meta: ['Accounts', 'Law', 'May 2026'],
    enrolled: '890 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    badge: 'Bestseller',
    starts: '12 May, 2026',
    ends: '15 Nov, 2026',
    price: '₹24,499',
    wasPrice: '₹32,999',
    language: 'Hinglish',
    type: 'Recorded',
  },
  {
    id: '3',
    title: 'Class 12 Commerce — Boards + CUET',
    meta: ['CBSE', 'Economics', 'CA Mayur Sanghvi'],
    enrolled: '2100 Students Enrolled',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    starts: '05 May, 2026',
    ends: '28 Feb, 2027',
    price: '₹16,999',
    wasPrice: '₹22,000',
    language: 'Hindi',
    type: 'Live',
  },
];

const FeaturedCourses: React.FC<{ courses?: FeaturedCourse[] }> = ({
  courses: dynamicCourses,
}) => {
  const displayCourses =
    dynamicCourses && dynamicCourses.length > 0
      ? dynamicCourses
      : fallbackCourses;
  const swiperRef = useRef<SwiperType | null>(null);
  const { selectedSlug } = useBoardSelection();
  const coursesHref = selectedSlug
    ? `/courses/${selectedSlug}`
    : '/our-courses';

  return (
    <section className="bg-white">
      <div className="custom-container">
        {/* Header Section - Modern Aligned */}
        <div className="flex max-sm:flex-col max-sm:items-center max-sm:text-center max-sm:gap-3 justify-between items-end mb-8 sm:mb-10 md:mb-16 gap-6">
          <div className="text-left max-sm:text-center max-w-180 flex flex-col text-lightgray">
            <p className="text-base md:text-lg sm:text-xl font-medium text-lightgray mb-2 md:mb-5 leading-[120%]">
              Our Courses
            </p>
            <h2 className="section-heading text-lightgray">
              Our Most Popular Courses
            </h2>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-3 sm:gap-5 shrink-0">
            <Link
              to={coursesHref}
              className="flex items-center gap-3 rounded-[38px] sm:px-3 sm:py-2 text-[#3a6bfc] text-base sm:text-[20px] font-medium leading-[1.2] hover:opacity-90 transition-opacity"
            >
              View All Courses
              <span className="flex size-6 items-center justify-center rounded-full bg-[#3a6bfc] text-white">
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          </div>
        </div>

        {/* Swiper Slider with Bleed Logic */}
        <div className="relative group">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            navigation={{
              nextEl: '.swiper-button-next-courses',
              prevEl: '.swiper-button-prev-courses',
            }}
            spaceBetween={16}
            slidesPerView={1.05}
            speed={600}
            grabCursor={true}
            draggable={true}
            touchEventsTarget="container"
            breakpoints={{
              640: { slidesPerView: 1.2, spaceBetween: 16 },
              768: { slidesPerView: 1.7, spaceBetween: 16 },
              1024: { slidesPerView: 2.5, spaceBetween: 20 },
              1280: { slidesPerView: 3.2, spaceBetween: 20 },
            }}
            className="w-full "
          >
            {displayCourses.map((course, index) => (
              <SwiperSlide
                key={`${course.id}-${index}`}
                className="h-auto! p-1"
              >
                <CourseCard course={course} isAlternate={index % 2 === 1} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            className="swiper-button-prev-courses absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[rgba(8,22,39,0.1)] shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous courses"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#081627"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className="swiper-button-next-courses absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[rgba(8,22,39,0.1)] shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next courses"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="#081627"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile View - Link Below Cards */}
        <div className="sm:hidden flex justify-center mt-6">
          <Link
            to={coursesHref}
            className="flex items-center gap-3 rounded-[38px] sm:px-3 sm:py-2 text-[#3a6bfc] text-base sm:text-[20px] font-medium leading-[1.2] hover:opacity-90 transition-opacity"
          >
            View All Courses
            <span className="flex size-6 items-center justify-center rounded-full bg-[#3a6bfc] text-white">
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
