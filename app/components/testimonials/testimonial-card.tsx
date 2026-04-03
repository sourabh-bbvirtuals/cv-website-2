interface TestimonialCardProps {
  name: string;
  message: string;
  imageUrl?: string;
  type?: 'home' | 'product';
}

const TestimonialCard = ({
  name,
  message,
  imageUrl,
  type = 'home',
}: TestimonialCardProps) => {
  return (
    <div
      className={`bg-white p-3 medium:p-6 rounded-2xl shadow-sm  flex flex-col max-h-[230px] w-full max-w-full min-w-full min-h-[180px] h-[180px] medium:min-h-[230px] medium:h-[230px]  ${
        type === 'home'
          ? 'xs:min-w-[270px]  medium:min-w-[360px]'
          : 'small:w-[413px] small:max-w-[413px]  '
      }`}
    >
      <div className="">
        <p className="font-light text-[14px]  medium:text-[17px] mb-4 line-clamp-5 xs:line-clamp-5 small:line-clamp-5 text-ellipsis">
          {message}
        </p>
      </div>
      <span className="flex flex-grow"></span>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-[16px] xs:text-[17px] medium:text-[20px] leading-[26px] text-[#2E2A47]">
          {name}
        </span>
        {/* <img
          src={imageUrl}
          alt={name}
          className="min-w-[48px] w-12 h-12 min-h-[48px] rounded-full object-cover"
        /> */}
      </div>
    </div>
  );
};

export default TestimonialCard;
