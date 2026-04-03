import { CardLabel } from './shared/CardLabel';

export const AddonProgramCard = ({
  index,
  name,
  image,
  type,
  description,
  format,
  duration,
}: {
  index: number;
  name: string;
  image: string;
  type: string;
  description: string;
  format: string;
  duration: string;
}) => {
  return (
    <div className="bg-[#FBFAF9] border border-[#E6E9EF] rounded-2xl p-0 relative">
      <span className="absolute top-2 left-2">
        <CardLabel text={type} />
      </span>

      <div className="w-full h-24 rounded-t-xl overflow-hidden bg-gradient-to-r from-orange-300 to-orange-500">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-fit" />
        ) : (
          <div
            className={`w-full h-full ${
              index % 2 === 0
                ? 'bg-gradient-to-r from-orange-300 to-orange-500'
                : 'bg-gradient-to-r from-purple-300 to-purple-500'
            }`}
          ></div>
        )}
      </div>

      <div className="space-y-3 px-2 py-4">
        <h3 className="font-semibold text-[#0F1723] text-sm truncate">
          {name}
        </h3>
        <p className="text-xs text-[#4A4A4A]">{description}</p>

        <div className="space-y-1 text-xs text-[#4A4A4A]">
          <div className="flex items-center gap-1">
            {format.toLowerCase().includes('live') ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.6442 7.40481C12.0082 8.77116 12.0082 10.984 10.6442 12.3503M12.2938 5.75515C14.5687 8.03266 14.5687 11.7225 12.2938 14M4.03966 14C1.76477 11.7225 1.76477 8.03266 4.03966 5.75515M5.68933 12.3503C4.32533 10.984 4.32533 8.77116 5.68933 7.40481"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 5.83333C6.3561 5.83333 5.83333 6.3561 5.83333 7C5.83333 7.6439 6.3561 8.16667 7 8.16667C7.6439 8.16667 8.16667 7.6439 8.16667 7C8.16667 6.3561 7.6439 5.83333 7 5.83333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="15"
                height="14"
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.83333 2.33333H12.1667C12.8106 2.33333 13.3333 2.8561 13.3333 3.5V10.5C13.3333 11.1439 12.8106 11.6667 12.1667 11.6667H2.83333C2.18943 11.6667 1.66667 11.1439 1.66667 10.5V3.5C1.66667 2.8561 2.18943 2.33333 2.83333 2.33333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.66667 4.66667H13.3333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.16667 7C4.52277 7 4 7.52277 4 8.16667C4 8.81057 4.52277 9.33333 5.16667 9.33333C5.81057 9.33333 6.33333 8.81057 6.33333 8.16667C6.33333 7.52277 5.81057 7 5.16667 7"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.16667 7H9.83333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.83333 7C9.18943 7 8.66667 7.52277 8.66667 8.16667C8.66667 8.81057 9.18943 9.33333 9.83333 9.33333C10.4772 9.33333 11 8.81057 11 8.16667C11 7.52277 10.4772 7 9.83333 7"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>{format}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.17}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
