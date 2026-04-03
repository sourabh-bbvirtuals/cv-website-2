export const CardLabel = ({ text }: { text: string }) => {
  return (
    <div className="px-2 py-1 bg-white border border-[#1E88E5] rounded-full flex justify-center items-center">
        <span className="text-xs font-semibold text-[#1E88E5]">{text}</span>
    </div>
  );
};
