enum SecondaryButtonWidth {
  full = 'w-full',
  auto = 'w-auto',
}

type SecondaryButtonProps = {
  text: string;
  width?: keyof typeof SecondaryButtonWidth;
  onClick?: () => void;
};

export const SecondaryButton = ({
  text,
  width,
  onClick,
}: SecondaryButtonProps) => {
  const widthClass = width ? SecondaryButtonWidth[width] : '';
  return (
    <button
      onClick={onClick}
      className={`${widthClass} h-8 px-4 py-1 rounded-lg text-sm font-semibold border transition-colors cursor-pointer bg-[#FBFAF9] text-[#1E88E5] border-[#1E88E5] hover:bg-[#E3F2FD]`}
    >
      {text}
    </button>
  );
};
