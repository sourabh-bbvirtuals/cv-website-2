import {
  MetaFunction,
  useLoaderData,
  useNavigate,
  useSubmit,
} from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { withZod } from '@remix-validated-form/with-zod';
import { useMemo, useRef, useState } from 'react';
import { ValidatedForm } from 'remix-validated-form';
import type { SearchQuery } from '~/generated/graphql';

import { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import FacetFilterControls from '~/components/facet-filter/FacetFilterControls';
import Layout from '~/components/Layout';
import { filteredSearchLoaderFromPagination } from '~/utils/filtered-search-loader';
import { ControlsBar } from '~/components/shared';
import MobileBottomNavigation from '~/components/bottom-navigation/mobile-bottom-navigation';
import { HomeIcon } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.title || 'Courses';
  return [
    {
      title,
    },
  ];
};

const paginationLimitMinimumDefault = 10;
const allowedPaginationLimits = new Set<number>([
  paginationLimitMinimumDefault,
  20,
  30,
]);

const { validator, filteredSearchLoader } = filteredSearchLoaderFromPagination(
  allowedPaginationLimits,
  paginationLimitMinimumDefault,
);

export async function loader(args: DataFunctionArgs) {
  const { request } = args;

  const {
    result,
    resultWithoutFacetValueFilters,
    facetValueIds,
    appliedPaginationLimit,
    appliedPaginationPage,
    term,
  } = await filteredSearchLoader({
    request,
    params: { slug: 'courses' },
  } as unknown as DataFunctionArgs);

  return {
    title: 'Courses',
    term,
    result,
    resultWithoutFacetValueFilters,
    facetValueIds,
    appliedPaginationLimit,
    appliedPaginationPage,
  };
}

type SearchItem = SearchQuery['search']['items'][number];

const extractPrice = (item: SearchItem) => {
  if (!item.priceWithTax) return 0;
  if ('value' in item.priceWithTax && item.priceWithTax.value != null) {
    return item.priceWithTax.value;
  }
  if ('min' in item.priceWithTax && item.priceWithTax.min != null) {
    return item.priceWithTax.min;
  }
  return 0;
};

function getDisplayPrices(item: SearchItem) {
  const currencyCode = item.currencyCode;
  if (!currencyCode || !item.priceWithTax) {
    return { price: '', offerPrice: '' };
  }

  const priceInPaise = extractPrice(item);

  if (!priceInPaise) {
    return { price: '', offerPrice: '' };
  }

  const offers = item.offers ? JSON.parse(item.offers) : [];
  const discountPrice = offers
    .map((offer: any) => offer.discountAmount)
    .reduce((a: number, b: number) => a + b, 0);
  const priceInRupees = priceInPaise / 100;
  const offerPrice = priceInRupees - discountPrice;
  return {
    price: `₹${priceInRupees.toLocaleString('en-IN')}`,
    offerPrice:
      discountPrice > 0 ? `₹${offerPrice.toLocaleString('en-IN')}` : undefined,
  };
}

export default function CoursesRoute() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const { result, resultWithoutFacetValueFilters, facetValueIds } = loaderData;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const facetValuesTracker = useRef(new FacetFilterTracker());
  facetValuesTracker.current.update(
    result,
    resultWithoutFacetValueFilters,
    facetValueIds,
  );
  const submit = useSubmit();

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('default');

  const items = (result.items || []) as SearchItem[];

  const sortedItems = useMemo(() => {
    let resultItems = [...items];
    if (sort === 'price-low-to-high') {
      resultItems.sort((a, b) => extractPrice(a) - extractPrice(b));
    } else if (sort === 'price-high-to-low') {
      resultItems.sort((a, b) => extractPrice(b) - extractPrice(a));
    }
    return resultItems;
  }, [items, sort]);

  const totalItems = result.totalItems ?? 0;
  const totalUnfilteredItems =
    resultWithoutFacetValueFilters?.totalItems ?? totalItems;
  const hasAnyProducts = (totalUnfilteredItems || 0) > 0;
  const hasFilteredResults = sortedItems.length > 0;

  return (
    <Layout>
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-['Inter',_sans-serif]">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c212f] tracking-tight">
            Courses
          </h2>
        </div>

        <ValidatedForm
          validator={withZod(validator)}
          method="get"
          onChange={(e) =>
            submit(e.currentTarget, { preventScrollReset: true })
          }
        >
          {!hasAnyProducts ? (
            <div className="mt-6 flex min-h-[60vh] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <div className="max-w-md space-y-3">
                <p className="text-base font-semibold text-[#414151]">
                  No courses available yet
                </p>
                <p className="text-[#414151] text-sm">
                  We&apos;re adding courses soon. Please check back in a little
                  while.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#1c212f] font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <HomeIcon className="w-4 h-4 text-[#1c212f]" />
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-8 lg:grid-cols-[280px,minmax(0,1fr)]">
              {/* Sidebar filters */}
              <aside className="lg:pt-2">
                <FacetFilterControls
                  facetFilterTracker={facetValuesTracker.current}
                  mobileFiltersOpen={mobileFiltersOpen}
                  setMobileFiltersOpen={setMobileFiltersOpen}
                />
              </aside>

              {/* Courses contents */}
              <section className="space-y-6">
                <ControlsBar
                  facetValueCount={facetValueIds.length}
                  appliedPaginationLimit={loaderData.appliedPaginationLimit}
                  appliedPaginationPage={loaderData.appliedPaginationPage}
                  totalItems={result.totalItems}
                  allowedPaginationLimits={allowedPaginationLimits}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                  layout={layout}
                  setLayout={setLayout}
                  sort={sort}
                  setSort={setSort}
                />

                {hasFilteredResults ? (
                  <div
                    className={
                      layout === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {sortedItems.map((item: SearchItem) => {
                      const { price, offerPrice } = getDisplayPrices(item);

                      return (
                        <a
                          key={item.productId}
                          href={`/product/${item.slug}`}
                          className={`group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#4aaeed]/30 transition-all duration-300 ${
                            layout === 'list'
                              ? 'flex flex-row gap-6 p-2'
                              : 'flex flex-col'
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden ${
                              layout === 'list'
                                ? 'w-48 shrink-0 rounded-lg'
                                : 'w-full aspect-video'
                            }`}
                          >
                            {item.productAsset?.preview ? (
                              <img
                                src={`${item.productAsset.preview}?w=400&h=225`}
                                alt={item.productName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
                                No image
                              </div>
                            )}
                          </div>
                          <div
                            className={`flex-1 flex flex-col ${
                              layout === 'list' ? 'py-2 pr-4' : 'p-4'
                            }`}
                          >
                            <h3 className="text-base font-bold text-[#1c212f] leading-snug line-clamp-2 group-hover:text-[#4aaeed] transition-colors mb-2">
                              {item.productName}
                            </h3>

                            <div className="mt-auto">
                              {(price || offerPrice) && (
                                <div className="flex items-baseline gap-2">
                                  {offerPrice ? (
                                    <>
                                      <span className="text-lg font-extrabold text-[#1c212f]">
                                        {offerPrice}
                                      </span>
                                      <span className="text-sm font-medium text-gray-400 line-through">
                                        {price}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-lg font-extrabold text-[#1c212f]">
                                      {price}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="mt-4">
                                <span className="text-[11px] font-bold text-[#4aaeed] uppercase tracking-widest bg-[#4aaeed]/5 px-2 py-1 rounded">
                                  View details
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  // Filtered-empty state
                  <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                    <div className="max-w-md space-y-3">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-base font-bold text-[#1c212f]">
                        No courses match these filters
                      </p>
                      <p className="text-sm text-gray-500">
                        Try removing one or more filters to see available
                        courses.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </ValidatedForm>
      </div>
      <MobileBottomNavigation />
    </Layout>
  );
}
