import React, { useEffect, useRef, useState, useCallback } from 'react';
import lottie from 'lottie-web';
import { motion, useScroll, useTransform } from 'framer-motion';
import StepCard from './StepCard';

const steps = {
  1: {
    title: 'Choose Your Exam',
    descrption:
      'Choose Class 11, 12 or CUET. Select your board and subjects.',
    video: '/assets/vid/Scene-1.mp4',
  },
  2: {
    title: 'Select Course & Make Purchase',
    descrption:
      'Choose from a wide range of courses and make a secure purchase.',
    video: '/assets/vid/Scene-2.mp4',
  },
  3: {
    title: 'Start Learning & Succeed',
    descrption:
      'Access your personalized learning path with adaptive courses and get real-time progress tracking.',
    video: '/assets/vid/Scene-3.mp4',
  },
};

export default function HowItWorks() {
  const { scrollY } = useScroll();

  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const container3Ref = useRef<HTMLDivElement>(null);
  const mobileContainer1Ref = useRef<HTMLDivElement>(null);
  const mobileContainer2Ref = useRef<HTMLDivElement>(null);
  const mobileContainer3Ref = useRef<HTMLDivElement>(null);

  // Desktop step wrapper refs for scroll animation
  const desktopStep1Ref = useRef<HTMLDivElement>(null);
  const desktopStep2Ref = useRef<HTMLDivElement>(null);
  const desktopStep3Ref = useRef<HTMLDivElement>(null);

  // State to store scroll ranges for each step
  const [scrollRanges, setScrollRanges] = useState({
    step1: { start: 0, center: 0, end: 0 },
    step2: { start: 0, center: 0, end: 0 },
    step3: { start: 0, center: 0, end: 0 },
  });

  useEffect(() => {
    const loadAnimation = (container: any, path: string) => {
      if (container) {
        const anim = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path,
        });
        return anim;
      }
    };

    const anim1 = loadAnimation(
      container1Ref.current,
      '/assets/json/Scene-1.json',
    );
    const anim2 = loadAnimation(
      container2Ref.current,
      '/assets/json/Scene-2.json',
    );
    const anim3 = loadAnimation(
      container3Ref.current,
      '/assets/json/Scene-3.json',
    );
    const mobileAnim1 = loadAnimation(
      mobileContainer1Ref.current,
      '/assets/json/Scene-1.json',
    );
    const mobileAnim2 = loadAnimation(
      mobileContainer2Ref.current,
      '/assets/json/Scene-2.json',
    );
    const mobileAnim3 = loadAnimation(
      mobileContainer3Ref.current,
      '/assets/json/Scene-3.json',
    );

    return () => {
      anim1?.destroy();
      anim2?.destroy();
      anim3?.destroy();
      mobileAnim1?.destroy();
      mobileAnim2?.destroy();
      mobileAnim3?.destroy();
    };
  }, []);

  // Calculate scroll ranges for each step when component mounts or window resizes
  useEffect(() => {
    const calculateScrollRanges = () => {
      const refs = [desktopStep1Ref, desktopStep2Ref, desktopStep3Ref];
      const newRanges = {
        step1: { start: 0, center: 0, end: 0 },
        step2: { start: 0, center: 0, end: 0 },
        step3: { start: 0, center: 0, end: 0 },
      };

      // First pass: calculate all centerScroll values
      const centerScrolls: number[] = [];
      refs.forEach((ref, index) => {
        if (ref.current) {
          const element = ref.current;
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;
          const viewportHeight = window.innerHeight;
          const elementHeight = rect.height;

          const centerScroll =
            elementTop + elementHeight / 2 - viewportHeight / 2;
          centerScrolls.push(centerScroll);
        }
      });

      // Second pass: calculate ranges with slower, smoother animations
      refs.forEach((ref, index) => {
        if (ref.current) {
          const element = ref.current;
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Start: earlier in viewport (60% above center for slower appearance)
          const startScroll = centerScrolls[index] - viewportHeight * 0.6;

          // End: further away for smoother, longer transitions
          // Last step ends even further away
          const endScroll =
            index < 2
              ? centerScrolls[index + 1] + viewportHeight * 0.3
              : centerScrolls[index] + viewportHeight * 2;

          const stepKey = `step${index + 1}` as keyof typeof newRanges;
          newRanges[stepKey] = {
            start: startScroll,
            center: centerScrolls[index],
            end: endScroll,
          };
        }
      });

      setScrollRanges(newRanges);
    };

    // Calculate on mount
    calculateScrollRanges();

    // Recalculate on window resize
    window.addEventListener('resize', calculateScrollRanges);

    return () => {
      window.removeEventListener('resize', calculateScrollRanges);
    };
  }, []);

  // Create transform mappings for each step's scale and opacity
  const createStepTransforms = useCallback(
    (stepKey: 'step1' | 'step2' | 'step3') => {
      const range = scrollRanges[stepKey];
      const { start, center, end } = range;

      // More gradual animation points for smoother transitions
      // Reach peak later in the scroll range for slower feel
      const p1 = start + (center - start) * 0.25; // 25% toward center
      const peak = start + (center - start) * 0.6; // 60% toward center (later peak)
      const p2 = center; // At center
      const p3 = center + (end - center) * 0.6; // 60% on descent path

      // Scale: smoother curve with more gradual transitions
      // [start, p1, peak, p2, p3, end] → [0.45, 0.60, 0.95, 1.0, 0.75, 0.45]
      const scale = useTransform(
        scrollY,
        [start, p1, peak, p2, p3, end],
        [0.45, 0.6, 0.95, 1.0, 0.75, 0.45],
      );

      // Opacity: smoother fade with more gradual transitions
      // [start, p1, peak, p2, p3, end] → [0.6, 0.75, 0.92, 1.0, 0.85, 0.6]
      const opacity = useTransform(
        scrollY,
        [start, p1, peak, p2, p3, end],
        [0.6, 0.75, 0.92, 1.0, 0.85, 0.6],
      );

      return { scale, opacity };
    },
    [scrollRanges, scrollY],
  );

  const step1Transforms = createStepTransforms('step1');
  const step2Transforms = createStepTransforms('step2');
  const step3Transforms = createStepTransforms('step3');

  return (
    <section className="custom-container home-section-y">
      <div className="flex flex-col items-center text-center">
        <p className="text-base md:text-xl font-medium text-gray-900 mb-3 md:mb-4 leading-[120%]">
          How it Works
        </p>
        <h2 className="section-heading font-semibold text-lightgray">
          From Zero to Personalized in 30 Seconds.
        </h2>
      </div>
      {/* desktop */}
      <div className="flex-col gap-4 hidden md:flex">
        <StepCard
          stepNumber={1}
          title={steps[1].title}
          description={steps[1].descrption}
          videoSrc={steps[1].video}
          isMobile={false}
          wrapperRef={desktopStep1Ref}
          scale={step1Transforms.scale}
          opacity={step1Transforms.opacity}
        />
        <StepCard
          stepNumber={2}
          title={steps[2].title}
          description={steps[2].descrption}
          videoSrc={steps[2].video}
          isMobile={false}
          wrapperRef={desktopStep2Ref}
          scale={step2Transforms.scale}
          opacity={step2Transforms.opacity}
        />
        <StepCard
          stepNumber={3}
          title={steps[3].title}
          description={steps[3].descrption}
          videoSrc={steps[3].video}
          isMobile={false}
          wrapperRef={desktopStep3Ref}
          scale={step3Transforms.scale}
          opacity={step3Transforms.opacity}
        />
      </div>
      {/* mobile */}
      <div className="flex-col gap-4 flex md:hidden p-4">
        <StepCard
          stepNumber={1}
          title={steps[1].title}
          description={steps[1].descrption}
          videoSrc={steps[1].video}
          isMobile={true}
        />
        <StepCard
          stepNumber={2}
          title={steps[2].title}
          description={steps[2].descrption}
          videoSrc={steps[2].video}
          isMobile={true}
        />
        <StepCard
          stepNumber={3}
          title={steps[3].title}
          description={steps[3].descrption}
          videoSrc={steps[3].video}
          isMobile={true}
        />
      </div>
    </section>
  );
}
