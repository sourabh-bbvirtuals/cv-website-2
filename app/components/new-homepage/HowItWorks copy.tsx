import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function HowItWorks() {
  const container1Ref = useRef(null);
  const container2Ref = useRef(null);
  const container3Ref = useRef(null);
  const mobileContainer1Ref = useRef(null);
  const mobileContainer2Ref = useRef(null);
  const mobileContainer3Ref = useRef(null);

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

  const steps = {
    1: {
      title: 'Choose Your Exam',
    },
    2: {
      title: 'Select Course & Make Purchase',
    },
    3: {
      title: 'Start Learning & Succeed',
    },
  };
  return (
    <section className="custom-container home-section-y">
      <div className="flex flex-col items-center text-center mb-10 md:mb-20 lg:mb-24">
        <p className="text-base md:text-xl font-medium text-gray-900 mb-3 md:mb-4 leading-[120%]">
          How it Works
        </p>
        <h2 className="section-heading font-semibold text-lightgray">
          From Zero to Personalized in 30 Seconds.
        </h2>
      </div>
      {/* desktop */}
      <div className="flex-col gap-4 hidden md:flex">
        {/* Step 01 */}
        <div className="flex flex-row gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-3xl font-semibold text-lightgray/20 leading-tight mt-20">
              Step 01.
            </p>
          </div>

          {/* Card */}
          <div
            ref={container1Ref}
            className="h-48 w-[500px] rounded-2xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(245, 247, 255, 0) 0%, #F5F7FF 100%)',
            }}
          />

          {/* Content */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold text-gray-300 mb-3 md:mb-4 leading-[120%]">
              Choose Your Exam
            </h3>
            <p className="text-base md:text-lg max-w-xs text-lightgray/60 leading-[150%]">
              Choose Class 11, 12, CA Foundation, or CUET. Select your board and
              subjects.
            </p>
          </div>
        </div>

        {/* Step 02 */}

        <div className="flex flex-row gap-4 md:gap-6 lg:gap-8 items-end justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-3xl font-semibold text-lightgray/40 leading-tight mb-8">
              Step 02.
            </p>
          </div>

          {/* Card */}
          <div
            ref={container2Ref}
            className="h-[510px] w-[680px] overflow-hidden rounded-2xl bg-[#F5F7FF]"
          />

          {/* Content */}
          <div className="flex flex-col justify-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              Select Course & Make Purchase
            </h3>
            <p className="text-base md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
              Choose Class 11, 12, CA Foundation, or CUET. Select your board and
              subjects.
            </p>
          </div>
        </div>

        {/* Step 03 */}
        <div className="flex flex-row gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div className="invisible">
            <p className="text-3xl font-semibold text-lightgray/20 leading-tight mt-20">
              Step 03.
            </p>
          </div>

          {/* Card */}
          <div
            ref={container3Ref}
            className="h-48 w-[500px] rounded-2xl"
            style={{
              background:
                'linear-gradient(180deg, #F5F7FF 0%, rgba(245, 247, 255, 0) 100%)',
            }}
          />

          {/* Content */}
          <div className="invisible">
            <h3 className="text-2xl font-semibold text-gray-300 mb-3 md:mb-4 leading-[120%]">
              Start Learning & Succeed
            </h3>
            <p className="text-base md:text-lg max-w-xs text-lightgray/60 leading-[150%]">
              Access your personalized learning path with adaptive courses and
              get real-time progress tracking.
            </p>
          </div>
        </div>
      </div>
      {/* mobile */}
      <div className="flex-col gap-4 flex md:hidden p-4">
        {/* Step 01 */}

        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-2xl font-semibold text-lightgray/40 leading-tight mb-4">
              Step 01.
            </p>
          </div>

          {/* Card */}
          <div
            ref={mobileContainer1Ref}
            className="h-[251.25px] w-[335px] overflow-hidden rounded-2xl"
          />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              {steps[1].title}
            </h3>
            <p className="text-sm text-center md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
              Choose Class 11, 12, CA Foundation, or CUET. Select your board and
              subjects.
            </p>
          </div>
        </div>

        {/* Step 02 */}

        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-2xl font-semibold text-lightgray/40 leading-tight mb-4">
              Step 02.
            </p>
          </div>

          {/* Card */}
          <div
            ref={mobileContainer2Ref}
            className="h-[251.25px] w-[335px] overflow-hidden rounded-2xl"
          />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              {steps[2].title}
            </h3>
            <p className="text-sm text-center md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
              Choose Class 11, 12, CA Foundation, or CUET. Select your board and
              subjects.
            </p>
          </div>
        </div>

        {/* Step 03 */}

        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-2xl font-semibold text-lightgray/40 leading-tight mb-4">
              Step 03.
            </p>
          </div>

          {/* Card */}
          <div
            ref={mobileContainer3Ref}
            className="h-[251.25px] w-[335px] overflow-hidden rounded-2xl"
          />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              {steps[3].title}
            </h3>
            <p className="text-sm text-center md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
              Access your personalized learning path with adaptive courses and
              get real-time progress tracking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
