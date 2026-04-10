import { MetaFunction, useLoaderData, useNavigate } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { APP_META_TITLE } from '~/constants';
import { createFilterGroups } from '~/utils/product-filtering';
import { useCollectionPage } from '~/hooks/use-collection-page';

import {
  HeroCarousel,
  FilterSidebar,
  EmptyState,
  PageTitle,
  TopFilters,
  ActiveFiltersIndicator,
  ProductGrid,
  Pagination,
} from '~/components/shared';
import Layout from '~/components/Layout';

import {
  getCollectionFacets,
  getCollectionFaculties,
  getProductsForCard,
  ProcessedFacet,
  ProductListItem,
} from '~/providers/products';
import { getCollectionData } from '~/utils/collection-data';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const name = data?.name || 'Products';

  return [
    {
      title: `${name} - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: `Discover our ${name.toLowerCase()} collection at Commerce Virtuals`,
    },
  ];
};

export async function loader({ params, request }: DataFunctionArgs) {
  const collectionSlug = params.slug;
  const url = new URL(request.url);

  // Check if the slug is in the allowed list
  if (!collectionSlug) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  // Get filter parameters from URL - SEO-friendly format
  const filters: Record<string, string[]> = {};

  // Parse SEO-friendly query parameters dynamically from URL
  // Extract all URL parameters as potential filters
  for (const [key, values] of url.searchParams.entries()) {
    if (values) {
      // Use pipe (|) as separator instead of comma to avoid conflicts with values containing commas
      const decodedValues = decodeURIComponent(values);
      filters[key] = decodedValues
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  // Get pagination parameters for client-side pagination
  const limit = 120; // Fetch up to 120 products for client-side pagination

  try {
    // Get collection data (banners and display name)
    const collectionData = await getCollectionData(collectionSlug, { request });
    if (!collectionData) {
      throw new Response('Not Found', {
        status: 404,
      });
    }
    // const facetValueFilters: Array<{ or?: string[]; and?: string }> =
    //   Object.entries(filters)
    //     .filter(([key, values]) => values && values.length > 0)
    //     .map(([key, values]) => {
    //       return { or: values }; // Pass codes directly, let getProductsForCard handle conversion
    //     })
    //     .filter((filter) => filter.or && filter.or.length > 0);

    const collectionFacets = await getCollectionFacets(collectionSlug, {
      request,
    });

    // Handle empty collection gracefully
    if (collectionFacets.length === 0) {
      return {
        id: collectionData.id || collectionSlug,
        name: collectionData.name,
        slug: collectionData.slug || collectionSlug,
        profileImageUrl: collectionData.profileImageUrl || '',
        banners: collectionData.banners,
        pageRules: collectionData.pageRules || {},
        productDisplayOrder: collectionData.productDisplayOrder || [],
        topCollectionFilter: collectionData.topCollectionFilter || [],
        facets: [],
        products: [],
        totalItems: 0,
        totalOriginalItems: 0,
        appliedFilters: filters,
        isEmpty: true,
        emptyReason: 'no_products_in_collection',
      };
    }

    const facultyFacet = collectionFacets.find(
      (facet) => facet.code === 'faculty',
    );

    // Handle missing faculty facet gracefully
    if (!facultyFacet) {
      return {
        id: collectionData.id || collectionSlug,
        name: collectionData.name,
        slug: collectionData.slug || collectionSlug,
        profileImageUrl: collectionData.profileImageUrl || '',
        banners: collectionData.banners,
        pageRules: collectionData.pageRules || {},
        productDisplayOrder: collectionData.productDisplayOrder || [],
        topCollectionFilter: collectionData.topCollectionFilter || [],
        facets: collectionFacets,
        products: [],
        totalItems: 0,
        totalOriginalItems: 0,
        appliedFilters: filters,
        isEmpty: true,
        emptyReason: 'no_faculty_facet',
      };
    }

    const collectionFaculties = await getCollectionFaculties(facultyFacet, {
      request,
    });
    // Get products with facets - single call with filters, no server-side pagination
    const productsWithFacets = await getProductsForCard(
      collectionSlug,
      { request },
      limit,
      collectionFacets,
      collectionFaculties,
      collectionData.productDisplayOrder,
    );

    // Filter out test series products - only show books and video lectures
    const filteredProducts = (productsWithFacets?.products || []).filter(
      (product) => {
        // Find product-type facet
        const productTypeFacet = product.productFacets?.find(
          (facet) =>
            facet.code.toLowerCase() === 'product-type' ||
            facet.name.toLowerCase() === 'product type',
        );

        // If no product-type facet found, include the product
        if (
          !productTypeFacet ||
          !productTypeFacet.values ||
          productTypeFacet.values.length === 0
        ) {
          return true;
        }

        // Check if product type is test series
        const productTypeValue =
          productTypeFacet.values[0]?.name?.toLowerCase() || '';
        const isTestSeries =
          productTypeValue.includes('test') &&
          productTypeValue.includes('series');

        // Exclude test series, include books and video lectures
        return !isTestSeries;
      },
    );

    return {
      id: collectionData.id || collectionSlug,
      name: collectionData.name,
      slug: collectionData.slug || collectionSlug,
      profileImageUrl: collectionData.profileImageUrl || '',
      banners: collectionData.banners, // Add banners to return data
      pageRules: collectionData.pageRules || {}, // Add page rules from collection
      productDisplayOrder: collectionData.productDisplayOrder || [], // Add product display order
      topCollectionFilter: collectionData.topCollectionFilter || [], // Add top collection filter
      facets: collectionFacets || [], // Use facets from the single call
      products: filteredProducts,
      totalItems: filteredProducts.length,
      totalOriginalItems: productsWithFacets?.totalItems || 0,
      appliedFilters: filters, // Pass applied filters to component
      // No server-side pagination - will be handled client-side
    };
  } catch (error) {
    console.error('Error loading collection:', error);

    // Handle specific error types
    if (error instanceof Response) {
      throw error;
    }

    // Handle network or other errors
    throw new Response(
      'Failed to load collection data. Please try again later.',
      {
        status: 500,
      },
    );
  }
}

export default function Products2Page() {
  const loaderData = useLoaderData<typeof loader>();
  const {
    id,
    name,
    slug,
    profileImageUrl,
    products,
    facets,
    appliedFilters,
    banners,
    pageRules,
    topCollectionFilter,
  } = loaderData as any;
  const isEmpty = 'isEmpty' in loaderData ? loaderData.isEmpty : false;
  const emptyReason =
    'emptyReason' in loaderData ? loaderData.emptyReason : undefined;

  const navigate = useNavigate();

  // Navigation handlers
  const handleProductNavigation = (productSlug: string, newTab: boolean) => {
    if (!productSlug) {
      return;
    }

    try {
      if (newTab) {
        window.open(`/courses2/product/${productSlug}`, '_blank');
      } else {
        navigate(`/courses2/product/${productSlug}`);
      }
    } catch (error) {
      // Fallback to product page
      navigate(`/courses2/product/${productSlug}`);
    }
  };

  // Use the shared collection page hook
  const {
    activeFilters,
    isFiltering,
    allProducts,
    totalPages,
    validCurrentPage,
    totalItems,
    showingStart,
    showingEnd,
    sidebarExcludedFacets,
    showTopFilter,
    topFilterType,
    topFilterFacet,
    gridFacets,
    coverImage,
    availableTopFilterGroupValues,
    topCollectionFilter: topCollectionFilterData,
    mainFilterFromUrl,
    subFilterFromUrl,
    selectedMainFilter,
    selectedSubFilter,
    currentSubFiltersCount,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleItemsPerPageChange,
    handleScrollToTop,
    updateTopFilterSelectionParams,
    computeGridColsClass,
  } = useCollectionPage({
    data: {
      products,
      facets,
      appliedFilters,
      pageRules,
      topCollectionFilter,
    },
    onProductNavigation: handleProductNavigation,
  });

  // Handle empty states early
  if (isEmpty) {
    if (emptyReason === 'no_products_in_collection') {
      return (
        <Layout>
          <EmptyState
            title="We will be back online in some time, stay tuned!"
            description={`Our ${name.toLowerCase()} collection is currently being updated with new content. Please check back soon for the latest offerings.`}
            icon="clock"
          />
        </Layout>
      );
    }

    if (emptyReason === 'no_faculty_facet') {
      return (
        <Layout>
          <EmptyState
            title={`${name} collection configuration in progress`}
            description={`Our ${name.toLowerCase()} collection is being set up with detailed information. Please check back soon for available items.`}
            icon="collection"
          />
        </Layout>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      <Layout>
        <HeroCarousel slides={banners || []} />
        <PageTitle name={name} />
        <main className="mx-auto max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-20 mt-4 sm:mt-6 grid lg:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
          <FilterSidebar
            filterGroups={createFilterGroups(
              (facets as ProcessedFacet[]) || [],
              sidebarExcludedFacets,
            )}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            activeFilters={activeFilters}
          />
          <section className="lg:col-span-9 space-y-6 sm:space-y-8 w-full min-w-0">
            <TopFilters
              showTopFilter={showTopFilter}
              topFilterType={topFilterType}
              topFilterFacet={topFilterFacet}
              availableTopFilterGroupValues={
                availableTopFilterGroupValues || []
              }
              topCollectionFilter={topCollectionFilterData || []}
              selectedMainFilter={selectedMainFilter}
              selectedSubFilter={selectedSubFilter}
              mainFilterFromUrl={mainFilterFromUrl}
              subFilterFromUrl={subFilterFromUrl}
              currentSubFiltersCount={currentSubFiltersCount}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              updateTopFilterSelectionParams={updateTopFilterSelectionParams}
              computeGridColsClass={computeGridColsClass}
              searchParams={new URLSearchParams()}
              setSearchParams={() => {}}
            />

            <ActiveFiltersIndicator
              activeFilters={activeFilters}
              isFiltering={isFiltering}
              onClearFilters={handleClearFilters}
              onFilterChange={handleFilterChange}
            />

            <ProductGrid
              products={allProducts}
              isFiltering={isFiltering}
              gridFacets={gridFacets}
              coverImage={coverImage}
              onProductNavigation={handleProductNavigation}
              collectionName={name}
              onClearFilters={handleClearFilters}
            />

            {allProducts.length > 0 && totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                validCurrentPage={validCurrentPage}
                totalItems={totalItems}
                showingStart={showingStart}
                showingEnd={showingEnd}
                itemsPerPage={30}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                onScrollToTop={handleScrollToTop}
              />
            )}
          </section>
        </main>
      </Layout>
    </div>
  );
}
