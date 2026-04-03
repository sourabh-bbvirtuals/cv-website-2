enum PrimaryButtonWidth {
  full = 'w-full',
  auto = 'w-auto',
}

type PrimaryButtonProps = {
  text: string;
  width?: keyof typeof PrimaryButtonWidth;
  onClick?: () => void;
};

export const PrimaryButton = ({ text, width, onClick }: PrimaryButtonProps) => {
  const widthClass = width ? PrimaryButtonWidth[width] : '';
  return (
    <button
      onClick={onClick}
      className={`${widthClass} h-8 px-4 py-1 rounded-lg text-sm font-semibold border transition-colors cursor-pointer bg-[#1E88E5] text-white border-[#0B99FF]`}
    >
      {text}
    </button>
  );
};
