const Hero = ({
  title = 'CBSE Class 12 Courses',
  subtitle = 'Join Class 11 Commerce online classes for expert-led coaching in Accounting, Economics, Maths, and more. Benefit from exam-focused learning with free study materials and mock tests.',
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <section className="min-h-100 4xl:min-h-150! pb-6 md:pb-10 4xl:pb-15! flex items-end bg-[#FFF8F9] border-b border-[#0816271A]">
      <div className="custom-container">
        <h2 className="section-heading mb-3 sm:mb-4 text-5xl font-semibold">
          {title}
        </h2>
        <p className="text-lightgray font-normal text-lg lg:text-xl leading-[150%]">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;
