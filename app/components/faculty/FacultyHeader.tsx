export const FacultyHeader = ({
  name,
  title,
  description,
  image,
}: {
  name: string;
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E6EEF8] shadow-sm p-6 lg:p-8 mb-3">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        {/* Faculty Image */}
        <div className="w-24 h-24 lg:w-[262px] lg:h-[248px] rounded-full lg:rounded-[45px] overflow-hidden flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        {/* Faculty Info */}
        <div className="flex-1 lg:max-w-[818px]">
          <div className="space-y-2 lg:space-y-2">
            <h1 className="text-2xl lg:text-2xl font-bold text-[#0F1724]">
              {name}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-base lg:text-base font-semibold text-[#0B99FF]">
                “{title}”
              </p>
              {/* Debug: Show tag value */}
            </div>
            {/* Debug Section */}
            <div
              className="text-[#0F1724] text-sm lg:text-sm leading-relaxed font-bold"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
