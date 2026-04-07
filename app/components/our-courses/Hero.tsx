const Hero = ({
  title = 'CBSE Class 12 Courses',
  subtitle = 'Join Class 11 Commerce online classes for expert-led coaching in Accounting, Economics, Maths, and more. Benefit from exam-focused learning with free study materials and mock tests.',
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <section className="h-[295px] pb-6 md:pb-10 4xl:pb-15! flex items-end bg-[#FFF8F9] border-b border-[#0816271A]">
      <div className="custom-container">
        <h2 className="section-heading mb-3 sm:mb-4">{title}</h2>
        <p className="text-lightgray font-normal text-base lg:text-xl leading-[150%]">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;
