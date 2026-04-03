import type { HomeBook } from '~/providers/home/types';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon } from 'lucide-react';

// Helper function to calculate discount percentage
function calculateDiscount(
  originalPrice: string,
  offerPrice: string,
): number | null {
  try {
    const orig = parseFloat(originalPrice?.replace(/[^\d.]/g, '') || '0');
    const offer = parseFloat(offerPrice?.replace(/[^\d.]/g, '') || '0');
    if (orig > 0 && offer > 0 && orig > offer) {
      return Math.round(((orig - offer) / orig) * 100);
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

export default function HomeBooks({
  heading,
  books,
  viewAllHref,
}: {
  heading: string;
  books: HomeBook[];
  viewAllHref?: string;
}) {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c212f]">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-[#8d8f95]">
              Comprehensive study materials and resources
            </p>
          </div>
          {viewAllHref && (
            <button
              type="button"
              onClick={() => navigate(viewAllHref)}
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-[#1c212f] hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-sm"
            >
              View all
            </button>
          )}
        </div>
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {books.map((book) => {
                const discount = calculateDiscount(book.price, book.offerPrice);

                return (
                  <div
                    key={book.id || book.slug}
                    className="group cursor-pointer h-full flex flex-col"
                    onClick={() => navigate(`/product/${book.slug}`)}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm group-hover:shadow-md transition-all">
                      {book.image ? (
                        <img
                          className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                          src={book.image + '?w=400&h=533'}
                          alt={book.title}
                        />
                      ) : (
                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                          <BookOpenIcon className="h-12 w-12 text-violet-300" />
                        </div>
                      )}

                      {/* Badge Section */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {discount !== null && discount > 0 && (
                          <div className="rounded-full bg-red-500 text-white px-3 py-1 text-xs font-bold shadow-lg">
                            -{discount}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-bold text-[#1c212f] leading-snug line-clamp-2 group-hover:text-[#4aaeed] transition-colors">
                        {book.title}
                      </h3>

                      {/* Pricing */}
                      {(book.price || book.offerPrice) && (
                        <div className="mt-2 flex items-baseline gap-2">
                          {book.offerPrice ? (
                            <>
                              <span className="text-base font-bold text-[#4aaeed]">
                                {book.offerPrice}
                              </span>
                              {book.price && (
                                <span className="text-xs font-medium text-[#8d8f95] line-through">
                                  {book.price}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-base font-bold text-[#1c212f]">
                              {book.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {viewAllHref && (
              <div className="mt-8 sm:hidden flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate(viewAllHref)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#1c212f] hover:bg-slate-100 transition-colors shadow-sm w-full"
                >
                  View all books
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state - placeholder cards */
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col">
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg" />
                <div className="mt-3 space-y-2 flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
            <div className="col-span-full text-center py-8">
              <p className="text-[#8d8f95] text-sm">
                Books coming soon! Check back shortly for books.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
