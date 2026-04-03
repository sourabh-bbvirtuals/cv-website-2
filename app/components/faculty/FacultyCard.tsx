export const FacultyCard = ({
  id,
  name,
  image,
  subject,
}: {
  id: string;
  name: string;
  image: string;
  subject: string;
}) => {
  return (
    <div
      key={id}
      className="bg-white border border-[#E6EEF8] rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-300 to-blue-500">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-blue-500"></div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-[#0F1724] text-sm">
            {name}
          </h4>
          <p className="text-xs text-[#9CA3AF]">{subject}</p>
        </div>
      </div>
      <button className="w-full py-2 border border-[#E6EEF8] text-[#0F1724] rounded-xl text-sm font-bold hover:bg-gray-50">
        View Faculty
      </button>
    </div>
  );
};
