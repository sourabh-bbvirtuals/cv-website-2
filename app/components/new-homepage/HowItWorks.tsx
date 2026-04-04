import React from 'react';

export default function HowItWorks() {
  return (
    <section className="custom-container home-section-y">
      <div className="flex flex-col items-center text-center mb-10 md:mb-20 lg:mb-24">
        <p className="text-base md:text-xl font-medium text-gray-900 mb-3 md:mb-4 leading-[120%]">
          How it Works
        </p>
        <h2 className="section-heading text-lightgray max-w-3xl text-2xl  md:text-5xl">
          From Zero to Personalized in 30 Seconds.
        </h2>
      </div>

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
          <div className="h-[510px] w-[680px] rounded-2xl bg-[#F5F7FF]" />

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

      <div className="flex-col gap-4 flex md:hidden p-2">
        {/* Step 01 */}

        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 items-center justify-center mx-auto w-full">
          {/* Step Label */}
          <div>
            <p className="text-2xl font-semibold text-lightgray/40 leading-tight mb-4">
              Step 01.
            </p>
          </div>

          {/* Card */}
          <div className="h-[251.25px] w-[335px] rounded-2xl bg-[#F5F7FF]" />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              Choose Your Exam
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
          <div className="h-[251.25px] w-[335px] rounded-2xl bg-[#F5F7FF]" />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              Select Course & Make Purchase
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
          <div className="h-[251.25px] w-[335px] rounded-2xl bg-[#F5F7FF]" />

          {/* Content */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h3 className=" text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-[120%]">
              Select Course & Make Purchase
            </h3>
            <p className="text-sm text-center md:text-lg max-w-xs text-lightgray/70 leading-[150%]">
              Choose Class 11, 12, CA Foundation, or CUET. Select your board and
              subjects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
