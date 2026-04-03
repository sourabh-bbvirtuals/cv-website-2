import { ProcessedFacet, ProductListItem } from "~/providers/products/productsWithFacets";

export interface Product {
  id: string;
  slug: string;
  name?: string;
  title?: string;
  level?: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  batchType?: string;
  attempt?: string;
  language?: string;
  productType?: string;
  subject?: Array<{
    abbreviation: string;
    id: string;
    code: string;
    name: string;
  }>;
  groupType?: string;
  courseType?: string;
  mode?: string;
  access?: string;
  duration?: string;
  specialization?: string;
  startDate?: string;
  pricing?: {
    current: string;
    original?: string;
  };
  price?: {
    min: number;
    max: number;
  } | {
    value: number;
  };
  currency?: string;
  badge?: {
    text: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    icon?: string;
  };
  faculties?: Array<{
    slug: string;
    name: string;
    image: string;
  }>;
  productFacets?: Array<{
    id: string;
    code: string;
    name: string;
    value: Array<{
      id: string;
      code: string;
      name: string;
    }>;
  }>;
  rating?: {
    score: number;
    total: number;
  };
}

export interface Facet {
  id: string;
  name: string;
  code: string;
  values: Array<{ name: string }>;
}


/**
 * Filters products based on active filters
 */
interface ActiveFilterValue {
  code: string;
  name: string;
}

interface ActiveFilter {
  facetCode: string;
  facetName: string;
  values: ActiveFilterValue[];
}

export const filterProducts = (
  products: ProductListItem[],
  filters: Record<string, ActiveFilter>,
  facets?: Facet[],
  levelFilter?: string,
  topFilterFacet?: string
): ProductListItem[] => {
  console.log('🔍 filterProducts called with:', {
    productsCount: products.length,
    filtersCount: Object.keys(filters).length,
    filters: filters,
    facetsCount: facets?.length || 0,
    topFilterFacet: topFilterFacet,
  });
  
  // First, filter the products based on the criteria
  const filteredProducts = products.filter((product) => {
    // Apply level filter if provided
    if (levelFilter && levelFilter !== 'all') {
      const productLevels = product.productFacets?.find(fp => fp.code.toLowerCase() === 'level')?.values.map(v => v.name) || [];
      if (!productLevels.includes(levelFilter)) {
        return false;
      }
    }

    // Separate top filter from sidebar filters
    const filterEntries = Object.entries(filters).filter(([_, activeFilter]) => activeFilter.values.length > 0);
    const topFilterEntry = topFilterFacet ? filterEntries.find(([groupId]) => groupId === topFilterFacet) : null;
    const sidebarFilterEntries = topFilterFacet 
      ? filterEntries.filter(([groupId]) => groupId !== topFilterFacet)
      : filterEntries;

    // If no filters are active, include all products
    if (filterEntries.length === 0) {
      return true;
    }

    // Helper function to check if product matches a filter group
    const matchesFilterGroup = ([groupId, activeFilter]: [string, ActiveFilter]): boolean => {
      const facet = facets?.find(f => f.code === groupId);
      if (!facet) {
        console.log('⚠️ Facet not found for groupId:', groupId, 'Available facets:', facets?.map(f => f.code));
        return false;
      }

      const productValues = product?.productFacets?.find(fp => fp.code.toLowerCase() === facet.code.toLowerCase())?.values.map(v => v.name) || [];
      console.log('🔍 Product filtering:', {
        productId: product.id,
        groupId,
        facetName: facet.name,
        productValues,
        selectedValues: activeFilter.values.map(v => v.name)
      });
      
      // If no product values found for this facet, this filter doesn't match
      if (productValues.length === 0) {
        return false;
      }
      
      // Check if any of the product values match any of the selected options
      return productValues.some(productValue => 
        activeFilter.values.some(selectedValue => selectedValue.name === productValue)
      );
    };

    // Logic:
    // - Sidebar filters: OR logic (product matches if it matches ANY sidebar filter group)
    // - Top filter: Single selection
    // - When both are selected: Top filter AND (Sidebar filters with OR logic)
    // - When only top filter: Just top filter
    // - When only sidebar filters: OR logic among sidebar filters
    
    if (topFilterEntry) {
      // Top filter is selected - product MUST match it (AND requirement)
      const matchesTopFilter = matchesFilterGroup(topFilterEntry);
      if (!matchesTopFilter) {
        console.log('❌ Product does not match top filter:', {
          productId: product.id,
          topFilterFacet: topFilterFacet,
          topFilterValues: topFilterEntry[1].values.map(v => v.code),
        });
        return false;
      }

      // If sidebar filters are also selected, product must match at least one (OR logic)
      if (sidebarFilterEntries.length > 0) {
        // const matchesAnySidebarFilter = sidebarFilterEntries.some(matchesFilterGroup); // OR logic
        const matchesAnySidebarFilter = sidebarFilterEntries.every(matchesFilterGroup); // AND logic
        console.log('🔍 Top filter + Sidebar filters check:', {
          productId: product.id,
          matchesTopFilter: true,
          matchesAnySidebarFilter,
          sidebarFilterCount: sidebarFilterEntries.length,
        });
        return matchesAnySidebarFilter;
      }

      // Only top filter selected, no sidebar filters - just return top filter match
      console.log('✅ Product matches top filter only:', {
        productId: product.id,
        topFilterFacet: topFilterFacet,
      });
      return true;
    } else {
      // No top filter selected - use OR logic for sidebar filters
      // Product matches if it matches ANY of the active filter groups
      if (sidebarFilterEntries.length === 0) {
        return true; // No filters at all
      }
      // const matchesAnyFilter = sidebarFilterEntries.some(matchesFilterGroup); // OR Logic
      const matchesAnyFilter = sidebarFilterEntries.every(matchesFilterGroup); // AND Logic
      console.log('🔍 Sidebar filters only check:', {
        productId: product.id,
        matchesAnyFilter,
        sidebarFilterCount: sidebarFilterEntries.length,
      });
      return matchesAnyFilter;
    }
  });

  // Remove duplicates based on product ID
  const uniqueProducts = filteredProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );

  return uniqueProducts;
};


/**
 * Faculty ordering configuration by slug
 * Using cleaned names (without CA/Sir) for ordering
 */
const FACULTY_ORDER_CONFIG: Record<string, string[]> = {
  'ca-inter': [
    'Jai Chawla',
    'Shubham Singhal',
    'Yash Khandelwal',
    'Vishal Bhattad',
    'Vinod Reddy',
    'Ravi Taori',
    'Prashant Sarda',
    'Amit Tated',
    'Bhanwar Borana',
    'Shirish Vyas',
    'Vijay Sarda',
    'Shubham Agrawal',
    'Pavan Karmele',
    'Rahul Garg',
    'Sanjay Saraf',
  ],
  'ca-final': [
    'Jai Chawla',
    'Pavan Karmele',
    'Ravi Taori',
    'Shubham Singhal',
    'Vishal Bhattad',
    'Bhanwar Borana',
  ],
  'ca-foundation': [
    'Parag',
    'Amol',
    'Aman',
  ],
};

/**
 * Subject ordering configuration by slug
 */
const SUBJECT_ORDER_CONFIG: Record<string, string[]> = {
  'ca-inter': [
    'Advanced Accounting',
    'Corporate and Other Laws',
    'Direct Tax',
    'Indirect Tax',
    'Cost and Management Accounting',
    'Auditing and Assurance',
    'Financial Management',
    'Strategic Management',
  ],
  'ca-final': [
    'Financial Reporting',
    'Advanced Financial Management',
    'Advanced Auditing, Assurance and Professional Ethics',
    'Direct Tax',
    'Indirect Tax',
    'Corporate and Other Laws',
  ],
  'ca-foundation': [
    'Accounting',
    'Business LAWs',
    'Quantitative Aptitude (Maths, LR & Stat)',
    'Business Economics',
  ],
};

/**
 * Clean faculty name by removing "CA " prefix and " Sir" suffix
 */
const cleanFacultyName = (name: string): string => {
  let cleaned = name;
  if (cleaned.startsWith('CA ')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith(' Sir')) {
    cleaned = cleaned.substring(0, cleaned.length - 4);
  }
  return cleaned;
};

/**
 * Format faculty name based on slug
 * For ca-foundation: adds " Sir" suffix
 * For other slugs: adds "CA " prefix
 */
const formatFacultyName = (name: string, slug?: string): string => {
  // If already formatted, return as is
  if (name.startsWith('CA ') || name.endsWith(' Sir')) {
    return name;
  }
  
  // Special case: Sanjay Saraf doesn't get CA prefix
  if (name === 'Sanjay Saraf') {
    return name;
  }
  
  // For ca-foundation, add "Sir" suffix (case-insensitive comparison)
  if (slug?.toLowerCase() === 'ca-foundation') {
    return `${name} Sir`;
  }
  
  // For all other cases, add "CA" prefix
  return `CA ${name}`;
};

/**
 * Sort faculty options based on the custom order for a given slug
 */
const sortFacultyOptions = (options: Array<{id: string; label: string; cleanedName: string}>, slug?: string): Array<{id: string; label: string}> => {
  if (!slug || !FACULTY_ORDER_CONFIG[slug]) {
    return options.map(({ id, label }) => ({ id, label }));
  }

  const orderMap = FACULTY_ORDER_CONFIG[slug];
  // Create index map using cleaned names
  const orderIndex = new Map(orderMap.map((name, idx) => [name.toLowerCase(), idx]));

  return [...options].sort((a, b) => {
    // Use cleaned name for ordering comparison (since orderMap uses cleaned names)
    const indexA = orderIndex.get(a.cleanedName.toLowerCase()) ?? 9999;
    const indexB = orderIndex.get(b.cleanedName.toLowerCase()) ?? 9999;
    
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // If not in the order list, sort alphabetically by cleaned name
    return a.cleanedName.localeCompare(b.cleanedName);
  }).map(({ id, label }) => ({ id, label }));
};

/**
 * Sort subject options based on the custom order for a given slug
 */
const sortSubjectOptions = (options: Array<{id: string; label: string}>, slug?: string): Array<{id: string; label: string}> => {
  if (!slug || !SUBJECT_ORDER_CONFIG[slug]) {
    return options;
  }

  const orderMap = SUBJECT_ORDER_CONFIG[slug];
  // Create index map using subject names
  const orderIndex = new Map(orderMap.map((name, idx) => [name.toLowerCase(), idx]));

  return [...options].sort((a, b) => {
    // Use label for ordering comparison
    const indexA = orderIndex.get(a.label.toLowerCase()) ?? 9999;
    const indexB = orderIndex.get(b.label.toLowerCase()) ?? 9999;
    
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // If not in the order list, sort alphabetically by label
    return a.label.localeCompare(b.label);
  });
};

/**
 * Creates filter groups from facets for the FilterSidebar component
 */
export const createFilterGroups = (facets: ProcessedFacet[], excludeFacets: string[] = [], slug?: string) => {
  return facets
    .filter((facet) => {
      const facetName = facet.name.toLowerCase();
      return !excludeFacets.some(exclude => facetName.includes(exclude));
    })
    .map((facet) => {
      // Deduplicate facet values to prevent duplicate keys
      const uniqueValues = facet.values.filter((value, index, self) => 
        index === self.findIndex(v => v.code === value.code)
      );
      
      const isFacultyFacet = facet.code.toLowerCase() === 'faculty';
      const isSubjectFacet = facet.code.toLowerCase() === 'subject';
      
      let options: Array<{ id: string; label: string; cleanedName?: string }> = uniqueValues.map((value) => ({
        id: value.code, // Use value code as ID for URL compatibility (slug without CA/Sir)
        label: isFacultyFacet ? formatFacultyName(value.name, slug) : value.name, // Format faculty name based on slug
        cleanedName: isFacultyFacet ? cleanFacultyName(value.name) : value.name, // Clean name for ordering
      }));

      // Sort faculty options if this is a faculty facet and we have a slug
      if (isFacultyFacet && slug) {
        options = sortFacultyOptions(options as Array<{id: string; label: string; cleanedName: string}>, slug);
      } else if (isSubjectFacet && slug) {
        // Sort subject options
        options = sortSubjectOptions(options.map(({ id, label }) => ({ id, label })), slug);
      } else {
        // Remove cleanedName from non-faculty or unsorted options
        options = options.map(({ id, label }) => ({ id, label }));
      }
      
      return {
        id: facet.code, // Use facet code as ID for URL compatibility
        name: facet.name,
        code: facet.code,
        options,
      };
    });
};
