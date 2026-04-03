import { Link } from '@remix-run/react';
import { CollectionsQuery } from '~/generated/graphql';

export function FacultyCard({
  collection,
}: {
  collection: CollectionsQuery['collections']['items'][number];
}) {
  return (
    <Link
      to={'/faculties/' + collection.slug}
      prefetch="intent"
      key={collection.id}
    >
      <div className="relative bg-white group h-full w-full overflow-hidden border p-2 md:p-4 rounded-2xl transition-transform duration-200 md:hover:scale-105 cursor-pointer">
        <img
          src={collection.featuredAsset?.preview || '/placeholder.jpg'} // Fallback image
          alt={collection.name || 'Unnamed Collection'}
          width={1000}
          height={1000}
          className="object-cover w-full h-full rounded-2xl"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:mb-2">
          <div className="max-w-max rounded-[8px] p-0.5 px-1.5 backdrop-blur-xl bg-gradient-to-r from-gray-500/50 to-black/50">
            <p className="text-white text-sm md:text-base font-medium text-center">
              {collection.name || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
