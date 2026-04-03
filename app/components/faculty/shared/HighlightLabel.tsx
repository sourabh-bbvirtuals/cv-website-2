export const HighlightLabel = ({ text }: { text: string }) => {
  return (
    <div className="bg-[#FBFAF9] px-2 py-1 rounded-tr-[13px] rounded-bl-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.1)] border border-[#E6E9EF] flex justify-center items-center">
      <span className="text-xs font-bold text-[#FF0000]">{text}</span>
    </div>
  );
};
