const Hero = ({
  title = 'Commerce Courses for Class 11 & 12',
  subtitle = "Join India's only commerce-exclusive platform covering CBSE, Maharashtra HSC and CUET-UG. Structured courses, organised test series & live mentorship for Class 11 & 12 students.",
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <section className="h-[295px] pb-6 md:pb-10 4xl:pb-15! flex items-end bg-[#FFF8F9] border-b border-[#0816271A]">
      <div className="custom-container">
        <h1 className="section-heading mb-3 sm:mb-4">{title}</h1>
        <p className="text-lightgray font-normal text-base lg:text-xl leading-[150%]">
          {subtitle}
        </p>
      </div>
    </section>
  );
};

export default Hero;
