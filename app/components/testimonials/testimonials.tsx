import React, { useEffect, useRef } from 'react';
import { motion, useAnimationControls, useMotionValue } from 'framer-motion';

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

const scrollingTestimonials = [
  ...testimonials,
  ...testimonials,
  ...testimonials,
];

// ─── Reusable ScrollColumn ────────────────────────────────────────────────────
interface ScrollColumnProps {
  direction: 'up' | 'down';
  duration: number;
  className?: string;
}

const TOTAL_DISTANCE = 1200;

const ScrollColumn = ({
  direction,
  duration,
  className = '',
}: ScrollColumnProps) => {
  const controls = useAnimationControls();
  const y = useMotionValue(direction === 'up' ? 0 : -TOTAL_DISTANCE);
  const isPaused = useRef(false);

  const fromY = direction === 'up' ? 0 : -TOTAL_DISTANCE;
  const toY = direction === 'up' ? -TOTAL_DISTANCE : 0;

  // pixels per second — stays constant always
  const speed = TOTAL_DISTANCE / duration;

  const startFromCurrent = () => {
    const current = y.get();
    const remaining = Math.abs(toY - current);
    // time = distance / speed  →  same speed as original
    const remainingDuration = remaining / speed;

    controls.start({
      y: toY,
      transition: {
        duration: remainingDuration,
        ease: 'linear',
        // after reaching end, restart full loop
        onComplete: () => {
          if (!isPaused.current) {
            y.set(fromY);
            startLoop();
          }
        },
      },
    });
  };

  const startLoop = () => {
    y.set(fromY);
    controls.start({
      y: toY,
      transition: {
        duration,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      },
    });
  };

  useEffect(() => {
    startLoop();
  }, []);

  const handleMouseEnter = () => {
    isPaused.current = true;
    controls.stop();
  };

  const handleMouseLeave = () => {
    isPaused.current = false;
    startFromCurrent();
  };

  return (
    <div
      className={`overflow-hidden relative h-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={controls}
        style={{ y }}
        className="flex flex-col gap-4 sm:gap-6"
      >
        {scrollingTestimonials.map((item, idx) => (
          <TestimonialCard key={idx} {...item} />
        ))}
      </motion.div>
    </div>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const Testimonials = () => {
  return (
    <section className="custom-container my-10 lg:my-12 md:my-14 4xl:my-20!">
      <div className="text-center mb-8 lg:mb-12 4xl:mb-16!">
        <p className="sm:text-xl font-medium text-lightgray md:mb-4">
          Testimonials
        </p>
        <h2 className="section-heading font-bold text-lightgray">
          What Our Students say
        </h2>
      </div>

      <div className="bg-[#0816270D] rounded-2xl p-3 sm:p-4 md:p-8 overflow-hidden h-175 relative border border-[#0816270D]/5">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent z-10 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-full">
          <ScrollColumn direction="up" duration={35} />
          <ScrollColumn
            direction="down"
            duration={40}
            className="hidden md:block"
          />
        </div>
      </div>
    </section>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const TestimonialCard = ({ text, name, subtitle }: TestimonialProps) => {
  return (
    <motion.div
      whileHover={{ borderColor: '#081627' }}
      transition={{ duration: 0.5 }}
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
