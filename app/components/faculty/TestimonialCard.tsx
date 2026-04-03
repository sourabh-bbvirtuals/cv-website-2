export const TestimonialCard = ({
  id,
  name,
  achievement,
  quote,
}: {
  id: string;
  name: string;
  achievement: string;
  quote: string;
}) => {
  return (
    <div
      key={id}
      className="bg-white border border-[#E6EEF8] rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-pink-500"></div>
        <div>
          <h4 className="font-bold text-[#0F1724] text-sm">
            {name}
          </h4>
          <p className="text-xs text-[#9CA3AF]">{achievement}</p>
        </div>
      </div>
      <p className="text-[#0F1724] text-sm">"{quote}"</p>
    </div>
  );
};
