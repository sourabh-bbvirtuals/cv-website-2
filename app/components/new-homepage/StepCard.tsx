import React, { RefObject, CSSProperties } from 'react';
import { motion, MotionValue } from 'framer-motion';

interface StepCardProps {
  stepNumber: 1 | 2 | 3;
  title: string;
  description: string;
  videoSrc: string;
  isMobile: boolean;
  wrapperRef?: RefObject<HTMLDivElement>;
  scale?: MotionValue<number>;
  opacity?: MotionValue<number>;
}

export default function StepCard({
  stepNumber,
  title,
  description,
  videoSrc,
  isMobile,
  wrapperRef,
  scale,
  opacity,
}: StepCardProps) {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
        {/* Step Label */}
        <div>
          <p className="text-2xl font-semibold text-lightgray/40 leading-tight mb-4">
            Step 0{stepNumber}.
          </p>
        </div>

        {/* Card */}
        <div className="h-[251.25px] w-[335px] overflow-hidden rounded-2xl">
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
            {title}
          </h3>
          <p className="text-sm text-center md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
            {description}
          </p>
        </div>
      </div>
    );
  }

  // Desktop version with animation
  const rightOffset = stepNumber === 2 ? 'right-[-100px]' : 'right-[-60px]';

  return (
    <motion.div
      ref={wrapperRef}
      className="flex items-center justify-center w-full relative"
      style={{
        scale: scale || 1,
        opacity: opacity !== undefined ? opacity : 1,
      }}
    >
      {/* Step Label - positioned absolutely so card stays centered */}
      <div className="absolute left-40 bottom-0">
        <p className="text-3xl font-semibold text-lightgray/40 leading-tight mb-8">
          Step 0{stepNumber}.
        </p>
      </div>

      <div className="h-[550px] w-[700px] overflow-hidden rounded-2xl bg-[#F5F7FF]">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div
        className={`absolute bottom-0 ${rightOffset} flex flex-col justify-center mb-8`}
      >
        <h3 className="text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
          {title}
        </h3>
        <p className="text-base md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
