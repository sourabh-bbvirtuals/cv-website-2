import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from '@remix-run/react';
import { filterProducts } from '~/utils/product-filtering';
import { getCollectionFaculties, getTopFilterProducts } from '~/providers/products';
import { ProcessedFacet, ProductListItem } from '~/providers/products';

// Define a better type for active filters that includes both code and display name
export interface ActiveFilterValue {
  code: string;
  name: string;
}

export interface ActiveFilter {
  facetCode: string;
  facetName: string;
  values: ActiveFilterValue[];
}

export interface CollectionPageData {
  products: ProductListItem[];
  facets: ProcessedFacet[];
  appliedFilters: Record<string, string[]>;
  pageRules?: {
    filter?: {
      topFilter?: boolean;
      topFilterType?: string;
      topFilterFacet?: string;
      sidebarExcludedFacets?: string[];
    };
    productCard?: {
      gridFacets?: string[];
      coverImage?: boolean;
    };
  };
  topCollectionFilter?: Array<{
    mainFilter: any;
    subFilters: any[];
  }>;
}

export interface UseCollectionPageOptions {
  data: CollectionPageData;
  onProductNavigation: (productSlug: string, newTab: boolean) => void;
}

export function useCollectionPage({ data, onProductNavigation }: UseCollectionPageOptions) {
  const {
    products,
    facets,
    appliedFilters,
    pageRules,
    topCollectionFilter,
  } = data;

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use page rules from collection
  const filterRule = pageRules?.filter || {};
  const productCardRule = pageRules?.productCard || {};
  const sidebarExcludedFacets = filterRule?.sidebarExcludedFacets || [];
  const showTopFilter = filterRule?.topFilter ?? false;
  const topFilterType = filterRule?.topFilterType ?? '';
  const topFilterFacet = filterRule?.topFilterFacet ?? '';
  const coverImage = productCardRule?.coverImage ?? false;
  const gridFacets =
    productCardRule?.gridFacets && productCardRule?.gridFacets?.length > 0
      ? productCardRule?.gridFacets
      : ['attempt', 'batch-type', 'product-type', 'language'];

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(120);

  // Store sorted products in state to avoid re-sorting on every render
  const [sortedProducts, setSortedProducts] = useState<ProductListItem[]>([]);

  // Store filtered products for client-side filtering
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>([]);

  // Get filter values from URL parameters
  const mainFilterFromUrl = searchParams.get('mainFilter') || '';
  const subFilterFromUrl = searchParams.get('subFilter') || '';

  // State for two-layer filter using actual data
  const [selectedMainFilter, setSelectedMainFilter] = useState<string>(mainFilterFromUrl);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>(subFilterFromUrl);
  const [collectionProducts, setCollectionProducts] = useState<ProductListItem[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Products are already sorted in the loader, just set them directly
  // Also filter out test series products
  useEffect(() => {
    if (products && products.length > 0) {
      const validProducts = products.filter(
        (product: any): product is ProductListItem => {
          if (product === null) return false;
          
          // Filter out test series products
          const productTypeFacet = product.productFacets?.find(
            (facet: any) =>
              facet.code.toLowerCase() === 'product-type' ||
              facet.name.toLowerCase() === 'product type'
          );
          
          if (productTypeFacet?.values?.length > 0) {
            const productTypeValue = productTypeFacet.values[0]?.name?.toLowerCase() || '';
            const isTestSeries = productTypeValue.includes('test') && productTypeValue.includes('series');
            if (isTestSeries) return false;
          }
          
          return true;
        },
      );
      setSortedProducts(validProducts);
    } else {
      setSortedProducts([]);
    }
  }, [products]);

  const availableTopFilterGroupValues =
    showTopFilter && topFilterFacet
      ? facets?.find((f: any) => f?.code === topFilterFacet)?.values
      : [];

  // Utility: compute responsive grid columns (clamped between min and max)
  const computeGridColsClass = (count: number, min: number, max: number) => {
    const clamped = Math.min(Math.max(count, min), max);
    switch (clamped) {
      case 2:
        return 'lg:grid-cols-2 xl:grid-cols-2';
      case 3:
        return 'lg:grid-cols-3 xl:grid-cols-3';
      case 4:
        return 'lg:grid-cols-4 xl:grid-cols-4';
      case 5:
        return 'lg:grid-cols-5 xl:grid-cols-5';
      case 6:
        return 'lg:grid-cols-6 xl:grid-cols-6';
      default:
        return 'lg:grid-cols-2 xl:grid-cols-2';
    }
  };

  // Memo helpers for currently selected top-filter group & subfilters
  const currentMainFilterSlug = selectedMainFilter || mainFilterFromUrl;
  const selectedTopFilterGroup = useMemo(() => {
    return (topCollectionFilter || []).find(
      (group: any) => group.mainFilter.slug === currentMainFilterSlug,
    );
  }, [topCollectionFilter, currentMainFilterSlug]);
  const currentSubFiltersCount = selectedTopFilterGroup?.subFilters?.length || 0;

  // Function to update URL parameters when top filter is selected
  const updateTopFilterSelectionParams = useCallback(
    (collectionSlug: string, isSubFilter: boolean = false) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (isSubFilter) {
        newSearchParams.set('subFilter', collectionSlug);
      } else {
        newSearchParams.set('mainFilter', collectionSlug);
        newSearchParams.delete('subFilter');
      }

      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  // Function to fetch products by collection slug (top filter specific)
  const fetchProductsForTopFilterCollection = useCallback(
    async (collectionSlug: string) => {
      console.log('🔍 fetchCollectionProducts called with:', collectionSlug);
      try {
        setIsFiltering(true);

        // Get main collection faculty data for consistency
        const facultyFacet = facets?.find((facet: any) => facet.code === 'faculty');

        let mainCollectionFaculties: any[] = [];
        if (facultyFacet) {
          mainCollectionFaculties = await getCollectionFaculties(facultyFacet, {
            request: new Request(window.location.href),
          });
        }

        // Use the new getTopFilterProducts function with main collection faculty data
        const result = await getTopFilterProducts(
          collectionSlug,
          { request: new Request(window.location.href) },
          120, // Fetch up to 120 products
          mainCollectionFaculties, // Pass main collection faculty data
        );

        console.log('🔍 Top filter products fetched:', {
          collectionSlug,
          productCount: result?.products?.length || 0,
          totalItems: result?.totalItems || 0,
          facultyDataCount: mainCollectionFaculties.length,
          products:
            result?.products?.map((p) => ({ id: p.id, name: p.name })) || [],
        });

        if (result?.products && result.products.length > 0) {
          // Filter out test series products from top filter results
          const filteredProducts = result.products.filter((product) => {
            const productTypeFacet = product.productFacets?.find(
              (facet: any) =>
                facet.code.toLowerCase() === 'product-type' ||
                facet.name.toLowerCase() === 'product type'
            );
            
            if (productTypeFacet?.values?.length && productTypeFacet.values.length > 0) {
              const productTypeValue = productTypeFacet.values[0]?.name?.toLowerCase() || '';
              const isTestSeries = productTypeValue.includes('test') && productTypeValue.includes('series');
              return !isTestSeries;
            }
            
            return true;
          });
          
          setCollectionProducts(filteredProducts);
          console.log('✅ Collection products set (filtered):', filteredProducts.length);
        } else {
          console.log('⚠️ No products found for collection:', collectionSlug);
          setCollectionProducts([]);
        }
      } catch (error) {
        console.error('❌ Error fetching collection products:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          collectionSlug,
        });
        setCollectionProducts([]);
      } finally {
        setIsFiltering(false);
      }
    },
    [facets],
  );

  // Effect to fetch products when URL parameters change
  useEffect(() => {
    // Sub filter has priority over main filter
    const targetSlug = subFilterFromUrl || mainFilterFromUrl;
    console.log('URL params changed:', {
      mainFilterFromUrl,
      subFilterFromUrl,
      targetSlug,
    });
    if (targetSlug) {
      fetchProductsForTopFilterCollection(targetSlug);
    } else {
      setCollectionProducts([]);
    }
  }, [mainFilterFromUrl, subFilterFromUrl, fetchProductsForTopFilterCollection]);

  // Sync state with URL parameters
  useEffect(() => {
    setSelectedMainFilter(mainFilterFromUrl);
    setSelectedSubFilter(subFilterFromUrl);
  }, [mainFilterFromUrl, subFilterFromUrl]);

  // Clear collection products when no URL parameters
  useEffect(() => {
    if (!mainFilterFromUrl && !subFilterFromUrl) {
      setCollectionProducts([]);
    }
  }, [mainFilterFromUrl, subFilterFromUrl]);

  // Memoize pagination calculations to avoid unnecessary recalculations
  const paginationData = useMemo(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredProducts.length / itemsPerPage),
    );
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = Math.max(0, (validCurrentPage - 1) * itemsPerPage);
    const endIndex = Math.min(
      filteredProducts.length,
      startIndex + itemsPerPage,
    );
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Calculate pagination info for better UX
    const totalItems = filteredProducts.length;
    const showingStart = totalItems > 0 ? startIndex + 1 : 0;
    const showingEnd = Math.min(endIndex, totalItems);

    return {
      totalPages,
      validCurrentPage,
      startIndex,
      endIndex,
      paginatedProducts,
      totalItems,
      showingStart,
      showingEnd,
    };
  }, [filteredProducts, currentPage, itemsPerPage]);

  const {
    totalPages,
    validCurrentPage,
    paginatedProducts,
    totalItems,
    showingStart,
    showingEnd,
  } = paginationData;
  const allProducts = paginatedProducts;

  // Initialize activeFilters from URL parameters on page load
  const [activeFilters, setActiveFilters] = useState<Record<string, ActiveFilter>>(() => {
    // Convert appliedFilters to the new structure
    const convertedFilters: Record<string, ActiveFilter> = {};

    if (appliedFilters) {
      Object.entries(appliedFilters).forEach(([facetCode, values]) => {
        // Find the facet to get its name
        const facet = facets?.find((f: any) => f?.code === facetCode);
        if (facet && (values as string[]).length > 0) {
          convertedFilters[facetCode] = {
            facetCode,
            facetName: facet.name,
            values: (values as string[]).map((valueCode: any) => {
              // Find the facet value to get its name
              const facetValue = facet.values.find((v: any) => v.code === valueCode);
              return {
                code: valueCode,
                name: facetValue?.name || valueCode,
              };
            }),
          };
        }
      });
    }

    return convertedFilters;
  });

  const handleFilterChange = useCallback(
    (
      groupCode: string, // facet code
      optionCode: string, // facet value code
      checked: boolean,
    ) => {
      // Show loading state immediately
      setIsFiltering(true);

      // Find the facet to get its name
      const facet = facets?.find((f: any) => f?.code === groupCode);
      if (!facet) return;

      // Find the facet value to get its name
      const facetValue = facet.values.find((v: any) => v.code === optionCode);
      if (!facetValue) return;

      // Check if there's a -cma variant of this filter
      const cmaGroupCode = `${groupCode}-cma`;
      const cmaFacet = facets?.find((f: any) => f?.code === cmaGroupCode);

      // Create a completely new filter object to avoid any reference issues
      const newFilters: Record<string, ActiveFilter> = {};

      // Copy all existing filters except the ones being modified (both regular and -cma variants)
      Object.entries(activeFilters).forEach(([key, filter]) => {
        if (key !== groupCode && key !== cmaGroupCode) {
          newFilters[key] = { ...filter };
        }
      });

      // Helper function to apply filter to a group code
      const applyFilterToGroup = (targetGroupCode: string, targetFacet: any) => {
        if (checked) {
          console.log('🔍 Filtering details:', topFilterFacet);
          // Check if this is a top filter facet - if so, replace all values (single selection)
          const isTopFilter = topFilterFacet && targetGroupCode === topFilterFacet;
          
          if (isTopFilter) {
            // For top filters, replace all values with only the selected one (single selection)
            newFilters[targetGroupCode] = {
              facetCode: targetGroupCode,
              facetName: targetFacet.name,
              values: [{ code: optionCode, name: facetValue.name }],
            };
          } else {
            // For sidebar filters, add to existing values (multiple selection allowed)
            const existingFilter = activeFilters[targetGroupCode];
            if (existingFilter) {
              // Check if value already exists
              const valueExists = existingFilter.values.some(
                (v) => v.code === optionCode,
              );
              if (!valueExists) {
                newFilters[targetGroupCode] = {
                  ...existingFilter,
                  values: [
                    ...existingFilter.values,
                    { code: optionCode, name: facetValue.name },
                  ],
                };
              } else {
                newFilters[targetGroupCode] = existingFilter;
              }
            } else {
              // Create new filter
              newFilters[targetGroupCode] = {
                facetCode: targetGroupCode,
                facetName: targetFacet.name,
                values: [{ code: optionCode, name: facetValue.name }],
              };
            }
          }
        } else {
          // Remove the option
          const existingFilter = activeFilters[targetGroupCode];
          if (existingFilter) {
            const filteredValues = existingFilter.values.filter(
              (v) => v.code !== optionCode,
            );
            if (filteredValues.length > 0) {
              newFilters[targetGroupCode] = {
                ...existingFilter,
                values: filteredValues,
              };
            }
            // If no values left, don't add the filter (it will be removed)
          }
        }
      };

      // Apply filter to the main group code
      applyFilterToGroup(groupCode, facet);

      // Also apply to -cma variant if it exists
      if (cmaFacet) {
        applyFilterToGroup(cmaGroupCode, cmaFacet);
      }

      // Update state immediately - no server call needed for client-side filtering
      setActiveFilters(newFilters);
      // Reset to page 1 when filtering
      setCurrentPage(1);

      // Update URL without causing server call (using replaceState to avoid navigation)
      const url = new URL(window.location.href);

      // Clear all existing filter parameters
      Object.keys(activeFilters).forEach((key) => url.searchParams.delete(key));

      // Add new filters to URL using pipe separator
      Object.entries(newFilters).forEach(([facetCode, filter]) => {
        if (filter.values.length > 0) {
          url.searchParams.set(
            facetCode,
            filter.values.map((v) => v.code).join('|'),
          );
        }
      });

      // Update URL without triggering navigation
      window.history.replaceState({}, '', url.pathname + url.search);

      // Hide loading state after a short delay to show the filtering effect
      setTimeout(() => setIsFiltering(false), 100);
    },
    [activeFilters, facets, topFilterFacet],
  );

  // Track if we've initialized filters from the loader
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Sync activeFilters with appliedFilters from loader only on initial load
  // After that, client-side changes take precedence
  useEffect(() => {
    // Only sync on initial load, not on every appliedFilters change
    if (filtersInitialized) {
      return;
    }

    // Convert appliedFilters to the new structure
    const convertedFilters: Record<string, ActiveFilter> = {};

    if (appliedFilters) {
      Object.entries(appliedFilters).forEach(([facetCode, values]) => {
        // Find the facet to get its name
        const facet = facets?.find((f: any) => f?.code === facetCode);
        if (facet && (values as string[]).length > 0) {
          convertedFilters[facetCode] = {
            facetCode,
            facetName: facet.name,
            values: (values as string[]).map((valueCode: any) => {
              // Find the facet value to get its name
              const facetValue = facet.values.find((v: any) => v.code === valueCode);
              return {
                code: valueCode,
                name: facetValue?.name || valueCode,
              };
            }),
          };
        }
      });
    }

    console.log('🔄 Initializing activeFilters from appliedFilters:', {
      filters: Object.keys(convertedFilters),
    });
    setActiveFilters(convertedFilters);
    setFiltersInitialized(true);
  }, [appliedFilters, facets, filtersInitialized]);

  // Reset loading state when new data arrives
  useEffect(() => {
    setIsFiltering(false);
  }, [products, facets]);

  // Reset pagination when products change (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedProducts]);

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Client-side filtering effect with nested top filter support
  useEffect(() => {
    console.log('🔍 Filtering useEffect triggered:', {
      sortedProductsCount: sortedProducts.length,
      hasUrlParams: !!(mainFilterFromUrl || subFilterFromUrl),
      mainFilter: mainFilterFromUrl,
      subFilter: subFilterFromUrl,
      collectionProductsCount: collectionProducts.length,
      activeFiltersCount: Object.keys(activeFilters).length,
      activeFilters: activeFilters,
      topFilterFacet: topFilterFacet,
    });

    if (sortedProducts.length > 0) {
      let filtered = sortedProducts;

      // If URL parameters are present, use nested filtering approach
      if (mainFilterFromUrl || subFilterFromUrl) {
        console.log('🔍 Using nested filtering (URL params present)');
        // First, get products from the selected collection
        if (collectionProducts.length > 0) {
          // Apply sidebar filters to the collection products (nested filtering)
          filtered = filterProducts(
            collectionProducts,
            activeFilters,
            facets as any,
            undefined,
            topFilterFacet,
          );
        } else {
          filtered = []; // Show empty while loading
        }
      } else {
        console.log('🔍 Using original filtering (no URL params)');
        // Use original filtering logic when no URL parameters
        // Always show original products with sidebar filters applied
        // For facet-based top filters, activeFilters will contain the level filter
        // Pass topFilterFacet to enable AND logic between top filter and sidebar filters
        filtered = filterProducts(sortedProducts, activeFilters, facets as any, undefined, topFilterFacet);
        
        console.log('🔍 Filtering details:', {
          inputProductsCount: sortedProducts.length,
          activeFiltersKeys: Object.keys(activeFilters),
          activeFiltersDetails: Object.entries(activeFilters).map(([key, filter]) => ({
            key,
            values: filter.values.map(v => v.code),
          })),
          filteredCount: filtered.length,
        });
      }

      console.log('🔍 Final filtered products:', {
        hasUrlParams: !!(mainFilterFromUrl || subFilterFromUrl),
        sortedProductsCount: sortedProducts.length,
        collectionProductsCount: collectionProducts.length,
        sidebarFiltersCount: Object.keys(activeFilters).length,
        filteredCount: filtered.length,
        mainFilter: mainFilterFromUrl,
        subFilter: subFilterFromUrl,
        activeFilters: Object.keys(activeFilters),
      });

      setFilteredProducts(filtered);
    } else {
      console.log('🔍 No sorted products, setting empty array');
      setFilteredProducts([]);
    }
  }, [
    sortedProducts,
    activeFilters,
    facets,
    mainFilterFromUrl,
    subFilterFromUrl,
    collectionProducts,
    topFilterFacet,
  ]);

  const handleClearFilters = useCallback(() => {
    console.log('🔍 Clearing all filters...', {
      sortedProductsCount: sortedProducts.length,
      activeFiltersCount: Object.keys(activeFilters).length,
      mainFilter: mainFilterFromUrl,
      subFilter: subFilterFromUrl,
    });

    setIsFiltering(true);
    setActiveFilters({});
    // Reset to page 1 when clearing filters
    setCurrentPage(1);

    // Clear collection products first
    setCollectionProducts([]);

    // Clear top filter state
    setSelectedMainFilter('');
    setSelectedSubFilter('');

    // Use setSearchParams to properly clear URL parameters
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);

    console.log('🔍 Filters cleared, should show original products');

    // Hide loading state after a short delay
    setTimeout(() => setIsFiltering(false), 100);
  }, [
    activeFilters,
    sortedProducts.length,
    mainFilterFromUrl,
    subFilterFromUrl,
    setSearchParams,
  ]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      // Ensure page is within bounds
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setCurrentPage(validPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages],
  );

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't interfere with form inputs
      }

      if (event.key === 'ArrowLeft' && validCurrentPage > 1) {
        event.preventDefault();
        handlePageChange(validCurrentPage - 1);
      } else if (event.key === 'ArrowRight' && validCurrentPage < totalPages) {
        event.preventDefault();
        handlePageChange(validCurrentPage + 1);
      } else if (event.key === 'Home' && validCurrentPage > 1) {
        event.preventDefault();
        handlePageChange(1);
      } else if (event.key === 'End' && validCurrentPage < totalPages) {
        event.preventDefault();
        handlePageChange(totalPages);
      }
    };

    if (totalPages > 1) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [validCurrentPage, totalPages, handlePageChange]);

  // Scroll to top handler
  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    // State
    activeFilters,
    isFiltering,
    allProducts,
    totalPages,
    validCurrentPage,
    totalItems,
    showingStart,
    showingEnd,
    
    // Configuration
    sidebarExcludedFacets,
    showTopFilter,
    topFilterType,
    topFilterFacet,
    gridFacets,
    coverImage,
    availableTopFilterGroupValues,
    topCollectionFilter,
    
    // URL state
    mainFilterFromUrl,
    subFilterFromUrl,
    selectedMainFilter,
    selectedSubFilter,
    currentSubFiltersCount,
    
    // Handlers
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleItemsPerPageChange,
    handleScrollToTop,
    updateTopFilterSelectionParams,
    computeGridColsClass,
    
    // Navigation handlers
    onProductNavigation,
  };
}
