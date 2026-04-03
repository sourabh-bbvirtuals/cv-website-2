import { LinkButton } from "./shared/LinkButton";

export const BookCard = ({
  id,
  title,
  cover,
  price,
  author,
  slug,
}: {
  id: string;
  title: string;
  cover: string;
  price: string;
  author: string;
  slug: string;
}) => {
  return (
    <div
      key={id}
      className="bg-[#FBFAF9] border border-[#E8E8E8] rounded-xl p-0 flex flex-col"
    >
      <div className="w-full h-60 rounded-t-lg overflow-hidden bg-[#F4F4F4]">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-1 px-3 pt-4 pb-2">
        <h3 className="font-bold text-black text-center text-base leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-[#787878] text-center">{author}</p>
        {price && (
          <p className="text-sm text-center font-bold text-[#1E88E5]">
            {price}
          </p>
        )}
      </div>
      <div className="mt-auto mb-2 mx-2">
        <LinkButton href={`/products/${slug}`}>View Details</LinkButton>
      </div>
    </div>
  );
};
