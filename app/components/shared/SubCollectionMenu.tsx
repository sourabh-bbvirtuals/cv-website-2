import { Link } from '@remix-run/react';

interface SubCollection {
  id: string;
  name: string;
  slug: string;
  title?: string; // From customFields
}

interface SubCollectionMenuProps {
  subCollections: SubCollection[];
  currentSlug?: string;
}

export function SubCollectionMenu({ subCollections, currentSlug }: SubCollectionMenuProps) {
  if (!subCollections || subCollections.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="mx-auto max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-4 scrollbar-hide">
          {subCollections.map((subCollection) => (
            <Link
              key={subCollection.id}
              to={`/courses2/${subCollection.slug}`}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                currentSlug === subCollection.slug
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-sm'
              }`}
            >
              {subCollection.title || subCollection.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

