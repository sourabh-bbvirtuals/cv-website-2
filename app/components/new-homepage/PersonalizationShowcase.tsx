import React from 'react';

/**
 * Figma 1:919 title + 1:917 steps (1:926, 1:933, 1:940)
 */
const steps = [
  {
    step: 'Step 01.',
    stepClass: 'text-[30px] tracking-[-0.3px]',
    title: 'Choose Your Exam',
    body: 'Choose Class 11, 12, CA Foundation, or CUET. Select your board and subjects.',
    boxClass:
      'h-[280px] sm:h-[340px] lg:h-[380px] max-w-[500px] w-full rounded-[20px]',
  },
  {
    step: 'Step 01.',
    stepClass: 'text-[30px] tracking-[-0.3px]',
    title: 'Choose Your Class',
    body: 'Choose Class 11, 12, CA Foundation, or CUET. Select your board and subjects.',
    boxClass:
      'h-[280px] sm:h-[340px] lg:h-[380px] max-w-[500px] w-full rounded-[20px]',
  },
  {
    step: 'Step 02.',
    stepClass: 'text-4xl sm:text-[36px] tracking-[-0.36px]',
    title: 'Select Course & Make Purchase',
    body: 'Choose Class 11, 12, CA Foundation, or CUET. Select your board and subjects.',
    boxClass:
      'h-[320px] sm:h-[420px] lg:h-[510px] max-w-[680px] w-full rounded-[24px]',
  },
];

const PersonalizationShowcase: React.FC = () => {
  return (
    <section className="relative py-14 lg:py-20 4xl:py-28! overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute -left-48 -top-48 w-[min(100vw,795px)] h-[min(100vw,795px)] rounded-full bg-[#3a6bfc]/[0.06]"
        aria-hidden
      />

      <div className="custom-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 px-2">
          <p className="text-xl font-medium text-lightgray mb-5 leading-[1.2]">
            Why Commerce Virtual
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-lightgray tracking-[-0.02em] leading-[1.15]">
            From Zero to Personalized in 30 Seconds.
          </h2>
        </div>

        <div className="rounded-[24px] sm:rounded-[32px] bg-[#fafbfd] border border-slate-200/80 overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-12 xl:p-14 space-y-14 lg:space-y-20">
            {steps.map((s, index) => (
              <div
                key={`${s.title}-${index}`}
                className={`flex flex-col gap-6 lg:gap-10 ${
                  index === 2
                    ? 'lg:flex-row lg:items-end'
                    : 'lg:flex-row lg:items-end'
                }`}
              >
                <div
                  className={`shrink-0 flex justify-start lg:justify-end ${
                    index === 2 ? 'lg:w-36' : 'lg:w-[250px]'
                  }`}
                >
                  <p
                    className={`font-semibold text-lightgray/30 leading-[1.2] whitespace-nowrap ${s.stepClass}`}
                  >
                    {s.step}
                  </p>
                </div>

                <div
                  className={`bg-[#f5f7ff] shrink-0 mx-auto lg:mx-0 ${s.boxClass}`}
                />

                <div className="flex-1 min-w-0 flex flex-col gap-3 text-lightgray lg:pb-8 pb-2 max-w-[403px] lg:max-w-none">
                  <h3 className="score-text">{s.title}</h3>
                  <p className="text-xl font-normal leading-normal max-w-[420px]">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalizationShowcase;
