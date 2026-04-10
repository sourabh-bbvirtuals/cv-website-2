import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
  lectureMode?: string;
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1.05);
  const [spaceBetween, setSpaceBetween] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const { selectedSlug } = useBoardSelection();
  const coursesHref = selectedSlug
    ? `/courses/${selectedSlug}`
    : '/our-courses';

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setSlidesPerView(3.2);
        setSpaceBetween(20);
      } else if (width >= 1024) {
        setSlidesPerView(2.5);
        setSpaceBetween(24);
      } else if (width >= 768) {
        setSlidesPerView(1.7);
        setSpaceBetween(100);
      } else if (width >= 640) {
        setSlidesPerView(1.2);
        setSpaceBetween(50);
      } else {
        setSlidesPerView(1.05);
        setSpaceBetween(30);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max slides
  const maxSlides = Math.ceil(
    displayCourses.length - Math.floor(slidesPerView),
  );

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const startX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setDragStart(startX);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const threshold = 50; // minimum pixels to trigger slide change

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    setDragOffset(0);
  };

  // Calculate slide width based on viewport and slides per view
  const getSlideWidth = () => {
    if (typeof window === 'undefined') return 390;
    const width = window.innerWidth;
    if (width >= 1280) return 414; // 390 + 24px gap
    if (width >= 1024) return 414; // 390 + 24px gap
    if (width >= 768) return 308; // approximate for tablet
    if (width >= 640) return 272; // approximate for small devices
    return 272; // mobile
  };

  const slideWidth = getSlideWidth();

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
        <div className="relative">
          <div className={`flex overflow-x-auto scrollbar-hide py-3 gap-4 `}>
            {displayCourses.map((course, index) => (
              <div key={`${course.id}-${index}`} className="">
                <CourseCard course={course} isAlternate={index % 2 === 1} />
              </div>
            ))}
          </div>
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
