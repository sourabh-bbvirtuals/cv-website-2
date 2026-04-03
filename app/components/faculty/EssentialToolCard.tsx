import { CardLabel } from './shared/CardLabel';
import { formatInr } from './util';

export const EssentialToolCard = ({
  index,
  name,
  image,
  type,
  description,
  format,
  priceInr,
}: {
  index: number;
  name: string;
  image: string;
  type: string;
  description: string;
  format: string;
  priceInr: string;
}) => {
  return (
    <div className="bg-[#FBFAF9] border border-[#E6E9EF] rounded-2xl p-0 relative">
      <span className="absolute top-2 left-2">
        <CardLabel text={type} />
      </span>

      <div className="w-full h-24 rounded-t-xl overflow-hidden bg-gradient-to-r from-red-300 to-red-500">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full ${
              index === 0
                ? 'bg-gradient-to-r from-red-300 to-red-500'
                : 'bg-gradient-to-r from-purple-300 to-purple-500'
            }`}
          ></div>
        )}
      </div>

      <div className="space-y-3 px-2 py-4">
        <h3 className="font-semibold text-[#0F1723] text-sm">{name}</h3>
        <p className="text-xs text-[#4A4A4A]">{description}</p>
        <div className="space-y-1 text-xs text-[#4A4A4A]">
          <div className="flex items-center space-x-1">
            {format.includes('1:1') ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 1.75C5.39025 1.75 4.08333 3.05691 4.08333 4.66667C4.08333 6.27642 5.39025 7.58333 7 7.58333C8.60975 7.58333 9.91667 6.27642 9.91667 4.66667C9.91667 3.05691 8.60975 1.75 7 1.75"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.6667 12.25C11.6667 9.6744 9.5756 7.58333 7 7.58333C4.4244 7.58333 2.33333 9.6744 2.33333 12.25"
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
                  d="M9.97742 4.52725C11.3414 5.8936 11.3414 8.1064 9.97742 9.47275M11.6271 2.87758C13.902 5.1551 13.902 8.8449 11.6271 11.1224M3.37292 11.1224C1.09802 8.8449 1.09802 5.1551 3.37292 2.87758M5.02258 9.47275C3.65858 8.1064 3.65858 5.8936 5.02258 4.52725"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 5.83333C6.8561 5.83333 6.33333 6.3561 6.33333 7C6.33333 7.6439 6.8561 8.16667 7.5 8.16667C8.1439 8.16667 8.66667 7.6439 8.66667 7C8.66667 6.3561 8.1439 5.83333 7.5 5.83333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            <span className="text-xs">{format}</span>
          </div>
          {priceInr !== undefined && (
            <div className="flex items-center space-x-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.24583 5.02833C2.07279 4.24885 2.31034 3.43501 2.87552 2.871C3.44071 2.307 4.25505 2.07116 5.03417 2.24583C5.46296 1.57522 6.20402 1.16946 7 1.16946C7.79598 1.16946 8.53704 1.57522 8.96583 2.24583C9.74618 2.07039 10.562 2.30686 11.1276 2.87242C11.6931 3.43799 11.9296 4.25382 11.7542 5.03417C12.4248 5.46296 12.8305 6.20402 12.8305 7C12.8305 7.79598 12.4248 8.53704 11.7542 8.96583C11.9288 9.74495 11.693 10.5593 11.129 11.1245C10.565 11.6897 9.75115 11.9272 8.97167 11.7542C8.5434 12.4274 7.80082 12.8351 7.00292 12.8351C6.20501 12.8351 5.46243 12.4274 5.03417 11.7542C4.25505 11.9288 3.44071 11.693 2.87552 11.129C2.31034 10.565 2.07279 9.75115 2.24583 8.97167C1.56997 8.54394 1.16029 7.79984 1.16029 7C1.16029 6.20016 1.56997 5.45606 2.24583 5.02833M4.66667 4.66667H9.33333M4.66667 7H9.33333"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.58333 9.91667L4.66667 9.33333H5.25C6.5378 9.33333 7.58333 8.2878 7.58333 7C7.58333 5.7122 6.5378 4.66667 5.25 4.66667"
                  stroke="#0F1723"
                  strokeWidth="1.16667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium text-[#1E88E5] text-sm">
                {formatInr(priceInr)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
