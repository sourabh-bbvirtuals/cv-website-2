import { HighlightLabel } from './shared/HighlightLabel';
import { SecondaryButton } from './shared/SecondaryButton';

export const BatchCard = ({
  id,
  badge,
  subjects,
  examDate,
  languages,
  format,
  price,
  level,
  title,
  detailsTag,
  faculties,
}: {
  id: string;
  badge: string;
  subjects: string;
  examDate: string;
  languages: string[];
  format: string[];
  price: string;
  level: string;
  title: string;
  detailsTag: string;
  faculties: string[];
}) => {
  return (
    <div className="bg-white border border-[#F4F4F4] rounded-2xl p-5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] relative overflow-hidden">
      {badge && (
        <span className="absolute top-1 right-2">
          <HighlightLabel text={badge} />
        </span>
      )}
      <div className="space-y-3">
        {/* Course Title: <Level> <Batch Type> */}
        <h3 className="text-base font-medium text-[#0F1723]">
          <span>{level}</span> <span className="text-[#1E88E5]">{title}</span>
        </h3>
        {/* Attempt on next line */}
        <p className="text-xs font-medium text-[#4A4A4A]">{examDate}</p>

        {/* Course Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-[#4A4A4A]">
                {subjects}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string, idx: number) => (
                <span
                  key={`lang-${idx}-${lang}`}
                  className="px-2 py-1 bg-white border border-[#1E88E5] rounded-full text-xs font-bold text-[#1E88E5]"
                >
                  {lang}
                </span>
              ))}
              {format.length === 1 && (
                <span className="px-3 py-1 bg-[#1E88E5] text-white rounded-full text-xs font-bold">
                  {format[0]}
                </span>
              )}
              {format.length === 2 && (
                <div className="inline-flex items-center border border-[#1E88E5] rounded-md overflow-hidden">
                  <span className="px-2 py-1 bg-[#1E88E5] text-white text-xs font-bold -mr-1 z-10 rounded-r-md">
                    {format[0]}
                  </span>
                  <span className="px-2 py-1 text-[#1E88E5] text-xs font-bold bg-white">
                    {format[1]}
                  </span>
                </div>
              )}
              {format.length > 2 &&
                format.map((fmt: string, idx: number) => {
                  return (
                    <span
                      key={`fmt-${idx}-${fmt}`}
                      className="px-3 py-1 bg-[#1E88E5] text-white rounded-full text-xs font-bold"
                    >
                      {fmt}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>

        <hr className="border-[#E6E9EF]" />

        {/* Faculties */}
        <div className="space-y-2">
          <p className="text-xs font-normal text-[#4A4A4A]">
            Faculties in this batch
          </p>
          <div className="flex items-center gap-1">
            {faculties.map((facultyImg: any, idx: number) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1E88E5] shadow-sm"
              >
                <img
                  src={facultyImg.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details Tag */}
        {detailsTag && (
          <div className="mt-3">
            <p className="text-base font-normal text-[#0F1723] leading-[1.21] uppercase">
              {detailsTag}
            </p>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <span className="text-[20px] font-bold text-[#1E88E5]">{price}</span>
          <SecondaryButton text="Buy Now" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};
