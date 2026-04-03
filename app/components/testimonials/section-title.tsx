const SectionTitle = ({ title }: { title: string }) => {
  return (
    <h2 className=" text-center text-[22px] small:text-[30px] leading-[29px] small:leading-[36px] font-bold">
      {title}
    </h2>
  );
};

export default SectionTitle;
