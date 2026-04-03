import { MetaFunction, useLoaderData, useNavigate } from '@remix-run/react';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { useEffect, useMemo, useState } from 'react';
import type { SearchQuery } from '~/generated/graphql';
import Layout from '~/components/Layout';
import MobileBottomNavigation from '~/components/bottom-navigation/mobile-bottom-navigation';
import { getFacetValues, search } from '~/providers/products';
import FacetFilterControls from '~/components/facet-filter/FacetFilterControls';
import type { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import { ControlsBar } from '~/components/shared';
import { HomeIcon } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.title || 'Products';
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

export async function loader(args: DataFunctionArgs) {
  const { request, params } = args;
  const facultySlug = params.facultySlug;
  const typeSlug = params.typeSlug;

  const facetValues = await getFacetValues({}, { request });
  const facultyFacet = facetValues?.facets?.items?.find(
    (facet) => facet.code === 'faculty',
  );
  const currentFacetValue = facultyFacet?.valueList.items.find(
    (facetValue) => facetValue.code === facultySlug,
  );

  if (!currentFacetValue) {
    throw new Response('Faculty Not Found', { status: 404 });
  }

  const facetValueFilterQuery = [
    {
      and: currentFacetValue?.id,
    },
  ];

  if (typeSlug?.includes('book')) {
    const productTypeFacetValue = facetValues?.facets?.items?.find(
      (facet) => facet.code === 'product-type',
    );
    const bookFacetValue = productTypeFacetValue?.valueList.items.find(
      (facetValue) => facetValue.code === 'book',
    );

    if (!bookFacetValue) {
      throw new Response('Book Not Found', { status: 404 });
    }

    facetValueFilterQuery.push({
      and: bookFacetValue.id,
    });
  }

  const searchResult = await search(
    {
      input: {
        groupByProduct: true,
        skip: 0,
        take: 50,
        facetValueFilters: facetValueFilterQuery,
      },
    },
    { request },
  );

  const allProducts = searchResult?.search?.items || [];
  const totalProductCount = searchResult?.search?.totalItems || 0;
  const searchFacetValues = searchResult?.search?.facetValues || [];
  const facetsWithValues = groupByFacetCode(searchFacetValues);

  return {
    title: currentFacetValue.name || 'Products',
    totalProductCount,
    facetsWithValues,
    products: allProducts,
  };
}

type SearchFacetValue = SearchQuery['search']['facetValues'][number];

function groupByFacetCode(data: SearchFacetValue[]) {
  return Object.values(
    data.reduce((acc, { facetValue }) => {
      const facetCode = facetValue.facet.code;

      if (!acc[facetCode]) {
        acc[facetCode] = {
          id: facetValue.facet.id,
          name: facetValue.facet.name,
          values: [],
        };
      }

      // Add unique facet values
      if (!acc[facetCode].values.find((v) => v.id === facetValue.id)) {
        acc[facetCode].values.push({
          id: facetValue.id,
          name: facetValue.name,
          code: facetValue.code,
          selected: false, // default value for checkbox
        });
      }

      return acc;
    }, {} as Record<string, { id: string; name: string; values: { id: string; name: string; code: string; selected: boolean }[] }>),
  );
}

type SearchItem = SearchQuery['search']['items'][number];

function getDisplayPrices(item: SearchItem) {
  const currencyCode = item.currencyCode;
  if (!currencyCode || !item.priceWithTax) {
    return { price: '', offerPrice: '' };
  }

  const priceInPaise =
    'value' in item.priceWithTax && item.priceWithTax.value != null
      ? item.priceWithTax.value
      : 'min' in item.priceWithTax && item.priceWithTax.min != null
      ? item.priceWithTax.min
      : 0;

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
    price: `₹${priceInRupees.toFixed(2)}`,
    offerPrice: discountPrice > 0 ? `₹${offerPrice.toFixed(2)}` : undefined,
  };
}

export default function ProductsRoute() {
  const navigate = useNavigate();
  const loaderData = useLoaderData<typeof loader>();
  const { title, totalProductCount, facetsWithValues, products } = loaderData;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [facetState, setFacetState] = useState(facetsWithValues);
  const [pageSize, setPageSize] = useState(paginationLimitMinimumDefault);
  const [page, setPage] = useState(1);

  const selectedByFacet = useMemo(
    () =>
      facetState
        .map((facet) => ({
          facetId: facet.id,
          selectedIds: facet.values.filter((v) => v.selected).map((v) => v.id),
        }))
        .filter((x) => x.selectedIds.length > 0),
    [facetState],
  );

  const totalSelectedFacetValues = useMemo(
    () => selectedByFacet.reduce((sum, f) => sum + f.selectedIds.length, 0),
    [selectedByFacet],
  );

  const filteredProducts: SearchItem[] = useMemo(() => {
    if (selectedByFacet.length === 0) {
      return products as SearchItem[];
    }

    // OR within same facet (any selected value), AND across facets
    return (products as SearchItem[]).filter((item) =>
      selectedByFacet.every((facetSel) =>
        facetSel.selectedIds.some((id) => item.facetValueIds.includes(id)),
      ),
    );
  }, [products, selectedByFacet]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(selectedByFacet)]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / (pageSize || paginationLimitMinimumDefault)),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize,
  );

  const hasAnyProducts = (totalProductCount || 0) > 0;
  const hasFilteredResults = paginatedProducts.length > 0;

  const handleToggleFacetValue = (
    facetId: string,
    valueId: string,
    selected: boolean,
  ) => {
    setFacetState((prev) =>
      prev.map((facet) =>
        facet.id !== facetId
          ? facet
          : {
              ...facet,
              values: facet.values.map((value) =>
                value.id === valueId ? { ...value, selected } : value,
              ),
            },
      ),
    );
  };

  const handleControlsChange: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextLimit =
      Number(formData.get('limit')) || paginationLimitMinimumDefault;
    const requestedPage = Number(formData.get('page')) || currentPage;

    const nextTotalPages = Math.max(
      1,
      Math.ceil(totalItems / (nextLimit || paginationLimitMinimumDefault)),
    );
    const nextPage = Math.min(Math.max(1, requestedPage), nextTotalPages);

    setPageSize(nextLimit);
    setPage(nextPage);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c212f]">
            {title}
          </h2>
        </div>

        {!hasAnyProducts ? (
          <div className="mt-6 flex min-h-[60vh] w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <div className="max-w-md space-y-3">
              <p className="text-base font-semibold text-[#414151]">
                No lectures available yet
              </p>
              <p className="text-[#414151] text-sm">
                We&apos;re adding lectures soon. Please check back in a little
                while.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#1c212f] font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <HomeIcon className="w-4 h-4 text-[#1c212f]" />
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[260px,minmax(0,1fr)]">
            {/* Sidebar filters */}
            <aside className="lg:pt-2">
              <FacetFilterControls
                facetFilterTracker={
                  {
                    facetsWithValues: facetState,
                  } as unknown as FacetFilterTracker
                }
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                onToggleFacetValue={handleToggleFacetValue}
              />
            </aside>

            {/* Products grid */}
            <section className="space-y-4">
              <form
                onChange={handleControlsChange}
                onSubmit={handleControlsChange}
              >
                <ControlsBar
                  facetValueCount={totalSelectedFacetValues}
                  appliedPaginationLimit={pageSize}
                  appliedPaginationPage={currentPage}
                  totalItems={totalItems}
                  allowedPaginationLimits={allowedPaginationLimits}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                />
              </form>

              {hasFilteredResults ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedProducts.map((item) => {
                    const { price, offerPrice } = getDisplayPrices(item);

                    return (
                      <a
                        key={item.productId}
                        href={`/product/${item.slug}`}
                        className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="overflow-hidden">
                          {item.productAsset?.preview ? (
                            <img
                              src={`${item.productAsset.preview}?w=400&h=225`}
                              alt={item.productName}
                              className="w-full aspect-video object-cover group-hover:opacity-90 transition-opacity"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full aspect-video bg-gradient-to-br from-violet-100 to-indigo-100" />
                          )}
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <h3 className="text-[15px] font-bold text-[#414151] leading-snug line-clamp-2 group-hover:text-[#4aaeed] transition-colors">
                            {item.productName}
                          </h3>

                          {(price || offerPrice) && (
                            <div className="mt-2 flex items-baseline gap-2">
                              {offerPrice ? (
                                <>
                                  <span className="text-sm font-bold text-[#4aaeed]">
                                    {offerPrice}
                                  </span>
                                  <span className="text-xs font-medium text-[#8d8f95] line-through">
                                    {price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-[#4aaeed]">
                                  {price}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <div className="max-w-md space-y-3">
                    <p className="text-base font-semibold text-gray-900">
                      No lectures match these filters
                    </p>
                    <p className="text-sm text-gray-500">
                      Try removing one or more filters to see available
                      lectures.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      <MobileBottomNavigation />
    </Layout>
  );
}
