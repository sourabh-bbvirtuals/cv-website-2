import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TestimonialProps {
  text: string;
  name: string;
  subtitle: string;
}

const testimonials = [
  {
    text: 'The structured approach made all the difference. Every concept was crystal clear, and the mock tests prepared me perfectly for the actual exam.',
    name: 'Priya Mehta',
    subtitle: 'Cleared FR in First Attempt',
  },
  {
    text: "Vishal Sir's teaching style is unmatched. He breaks down complex IFRS standards into simple, digestible pieces. Highly recommend.",
    name: 'Arjun Sharma',
    subtitle: 'Score: 68/100',
  },
  {
    text: 'The structured approach made all the difference. Every concept was crystal clear, and the mock tests prepared me perfectly for the actual exam.',
    name: 'Priya Mehta',
    subtitle: 'Cleared FR in First Attempt',
  },
  {
    text: "Vishal Sir's teaching style is unmatched. He breaks down complex IFRS standards into simple, digestible pieces. Highly recommend.",
    name: 'Arjun Sharma',
    subtitle: 'Score: 68/100',
  },
];

const Testimonials = ({
  title,
  testimonials: dynamicTestimonials,
}: {
  title?: string;
  testimonials?: TestimonialProps[];
}) => {
  const displayTestimonials =
    dynamicTestimonials && dynamicTestimonials.length > 0
      ? dynamicTestimonials
      : testimonials;

  const scrollingTestimonials = [
    ...displayTestimonials,
    ...displayTestimonials,
    ...displayTestimonials,
  ];
  // Hover state to control animation
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="custom-container">
      <div className="text-center mb-8 lg:mb-12 4xl:mb-16!">
        <p className="sm:text-xl font-medium text-lightgray mb-3 4xl:mb-4!">
          Testimonials
        </p>
        <h2 className="section-heading font-semibold text-lightgray">
          {title || 'What Our Students say'}
        </h2>
      </div>

      <div
        className="bg-[#0816270D] rounded-2xl p-3 sm:p-4 md:p-8 overflow-hidden h-175 relative border border-[#0816270D]/5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top & Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent z-10 pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-full">
          {/* Column 1 - Moving Up */}
          <div className="overflow-hidden relative h-full">
            <motion.div
              className="flex flex-col gap-4 sm:gap-6"
              animate={isPaused ? {} : { y: [0, -1200] }}
              transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            >
              {scrollingTestimonials.map((item, idx) => (
                <TestimonialCard key={idx} {...item} />
              ))}
            </motion.div>
          </div>

          {/* Column 2 - Moving Down */}
          <div className="hidden md:block overflow-hidden relative h-full">
            <motion.div
              className="flex flex-col gap-4 sm:gap-6"
              animate={isPaused ? {} : { y: [-1200, 0] }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              {scrollingTestimonials.map((item, idx) => (
                <TestimonialCard key={idx} {...item} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ text, name, subtitle }: TestimonialProps) => {
  return (
    <motion.div
      // 1. Framer motion ka exact hover border color
      whileHover={{
        borderColor: '#081627',
      }}
      // 2. Transition duration ko 0 kar diya hai taaki instant border aaye
      transition={{ duration: 0.5 }}
      // 3. Tailwind ki 'transition-colors duration-300' class hata di hai
      className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 min-h-50 sm:min-h-60 flex flex-col justify-between border border-transparent cursor-pointer"
    >
      <p className="text-lightgray text-base sm:text-lg 4xl:text-xl! leading-[140%] font-normal">
        "{text}"
      </p>
      <div className="sm:mt-8">
        <h4 className="font-medium text-lg sm:text-xl 4xl:text-2xl! text-lightgray leading-[120%]">
          {name}
        </h4>
        <p className="text-lightgray/40 text-base leading-[120%] mt-2 font-medium">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};
export default Testimonials;
