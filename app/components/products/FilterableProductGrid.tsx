import FacetFilterControls from '~/components/facet-filter/FacetFilterControls';
import { ProductCard } from '~/components/products/ProductCard';
import {
  translatePaginationFrom,
  translatePaginationTo,
} from '~/utils/pagination';
import { Pagination } from '~/components/Pagination';
import { NoResultsHint } from '~/components/products/NoResultsHint';
import { useRef } from 'react';
import { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import { filteredSearchLoaderFromPagination } from '~/utils/filtered-search-loader';
import { useTranslation } from 'react-i18next';

export function FilterableProductGrid({
  result,
  resultWithoutFacetValueFilters,
  facetValueIds,
  appliedPaginationPage,
  appliedPaginationLimit,
  allowedPaginationLimits,
  mobileFiltersOpen,
  setMobileFiltersOpen,
}: Awaited<
  ReturnType<
    ReturnType<
      typeof filteredSearchLoaderFromPagination
    >['filteredSearchLoader']
  >
> & {
  allowedPaginationLimits: Set<number>;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (arg0: boolean) => void;
}) {
  const { t } = useTranslation();
  const facetValuesTracker = useRef(new FacetFilterTracker());

  facetValuesTracker.current.update(
    result,
    resultWithoutFacetValueFilters,
    facetValueIds,
  );

  const getProductTypeForItem = (item: any) => {
    // Add null check for facetsWithValues
    if (!facetValuesTracker.current?.facetsWithValues || !Array.isArray(facetValuesTracker.current.facetsWithValues)) {
      // Fallback logic when facetsWithValues is not available
      const facet = item.facetIds?.find((v: string) => v === '8');
      if (facet) {
        const facetValueBooks = item.facetValueIds?.find(
          (v: string) => v === '24',
        );
        const facetValueLiveRecorded = item.facetValueIds?.find(
          (v: string) => v === '92',
        );
        if (facetValueBooks && facetValueLiveRecorded) {
          return 'Books , Live + Recorded';
        }
        if (facetValueBooks) {
          return 'Books';
        }
      }
      return 'Online Courses';
    }

    const facet = facetValuesTracker.current.facetsWithValues.find(
      (f: any) => f.id === '8',
    );

    if (!facet) {
      const facet = item.facetIds?.find((v: string) => v === '8');
      if (facet) {
        const facetValueBooks = item.facetValueIds?.find(
          (v: string) => v === '24',
        );
        const facetValueLiveRecorded = item.facetValueIds?.find(
          (v: string) => v === '92',
        );
        if (facetValueBooks && facetValueLiveRecorded) {
          return 'Books , Live + Recorded';
        }
        if (facetValueBooks) {
          return 'Books';
        }
      }
      return 'Online Courses';
    }

    const matches = (facet.values || [])
      .filter((v: any) => (item.facetValueIds || []).includes(v.id))
      .map((v: any) => {
        if (v.name === 'Video Lecture') return 'Online Courses';
        if (v.name === 'Book') return 'Books';
        return v.name;
      });

    return matches.length ? matches.join(', ') : 'Online Courses';
  };

  return (
    <div className="mt-6 grid sm:grid-cols-5 gap-x-4">
      <FacetFilterControls
        facetFilterTracker={facetValuesTracker.current}
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
      />
      {(result.items?.length || 0) > 0 ? (
        <div className="sm:col-span-5 lg:col-span-4 space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 xl:gap-8">
            {(result.items || []).map((item: any) => (
              <ProductCard
                key={item.productId}
                currentProductType={getProductTypeForItem(item)} // Use function for each item
                {...item}
              />
            ))}
          </div>

          <div className="flex flex-row justify-between items-center gap-4">
            <span className="self-start text-gray-500 text-sm mt-2">
              {t('product.showing')}{' '}
              {translatePaginationFrom(
                appliedPaginationPage,
                appliedPaginationLimit,
              )}{' '}
              {t('product.to')}{' '}
              {translatePaginationTo(
                appliedPaginationPage,
                appliedPaginationLimit,
                result.items?.length || 0,
              )}
            </span>
            <Pagination
              appliedPaginationLimit={appliedPaginationLimit}
              allowedPaginationLimits={allowedPaginationLimits}
              totalItems={result.totalItems}
              appliedPaginationPage={appliedPaginationPage}
            />
          </div>
        </div>
      ) : (
        <NoResultsHint
          facetFilterTracker={facetValuesTracker.current}
          className={'sm:col-span-4 sm:p-4'}
        />
      )}
    </div>
  );
}
