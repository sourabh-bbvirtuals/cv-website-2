import { SearchInput } from '~/gql/graphql';
import { QueryOptions, sdk } from '../../graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

// Types for our provider
export interface ProcessedFacet {
  id: string;
  name: string;
  code: string;
  values: Array<{
    id: string;
    name: string;
    code: string;
    count: number;
  }>;
}

interface ProductList {
  products: ProductListItem[];
  totalItems: number;
  collectionFacetValues: ProcessedFacet[];
}

export interface ProductListItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: { min: number; max: number };
  currency: string;
  pricing: {
    current: string;
    original?: string;
  };
  sellerSku?: string | null;
  productFacets: ProcessedFacet[];
  faculty: {
    code: string;
    slug: string;
    name: string;
    image: string;
  }[];
  orderNumber: number;
  isFeatured: boolean;
  totalDiscount: number;
}

/**
 * Process and deduplicate facets from Vendure search results
 */
export function processFacets(facetValues: any[]): ProcessedFacet[] {
  const facetMap = new Map();
  facetValues.forEach((facetValue) => {
    const facet = facetValue.facetValue.facet;
    const value = facetValue.facetValue;
    const count = facetValue.count;

    if (!facetMap.has(facet.id)) {
      facetMap.set(facet.id, {
        id: facet.id,
        code: facet.code,
        name: facet.name,
        values: new Map(),
      });
    }

    const facetGroup = facetMap.get(facet.id);
    if (!facetGroup.values.has(value.id)) {
      facetGroup.values.set(value.id, {
        id: value.id,
        code: value.code,
        name: value.name,
        count: count,
      });
    }
  });
  // Convert Map to Array format and ensure no duplicates
  const processedFacets = Array.from(facetMap.values()).map((facet) => {
    const values = Array.from(facet.values.values()) as Array<{
      id: string;
      name: string;
      code: string;
      count: number;
    }>;
    
    // Additional deduplication by code to prevent duplicate keys
    const uniqueValues = values.filter((value, index, self) => 
      index === self.findIndex(v => v.code === value.code)
    );
    
    return {
      id: facet.id,
      name: facet.name,
      code: facet.code,
      values: uniqueValues,
    };
  });
  
  return processedFacets;
}

/**
 * Get unique product facets from facetValueIds using collectionFacets
 * Maps facetValueIds to ProcessedFacet[] structure
 */
function getProductFacetsFromIds(
  facetValueIds: string[],
  collectionFacets: ProcessedFacet[],
): ProcessedFacet[] {
  const facetMap = new Map<string, ProcessedFacet>();

  // Process each facetValueId
  facetValueIds.forEach(facetValueId => {
    // Find the facet and facetValue that matches this ID
    for (const facet of collectionFacets) {
      const facetValue = facet.values.find(value => value.id === facetValueId);
      if (facetValue) {
        if (facetMap.has(facet.id)) {
          // Facet already exists, add the value if it doesn't exist
          const existingFacet = facetMap.get(facet.id)!;
          const valueExists = existingFacet.values.some(v => v.id === facetValue.id);
          if (!valueExists) {
            existingFacet.values.push(facetValue);
          }
        } else {
          // Create new facet with this value
          facetMap.set(facet.id, {
            id: facet.id,
            code: facet.code,
            name: facet.name,
            values: [facetValue]
          });
        }
        break; // Found the facet, no need to continue searching
      }
    }
  });

  return Array.from(facetMap.values());
}

/**
 * Create dynamic product list from search results using individual product facets
 */
async function createProductList(
  collectionFacets: ProcessedFacet[],
  searchItems: any[],
  collectionFaculties: {
    code: string;
    slug: string;
    name: string;
    image: string;
  }[],
  productDisplayOrder: {
    slug: string;
    orderNumber: number;
    isFeatured: boolean;
    offers?: Array<{
      offerId: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
    }>;
  }[],
  options: QueryOptions,
): Promise<ProductListItem[]> {
  // Create a cache for faculty data to avoid duplicate API calls
  const facultyCache = new Map<string, any>();

  // Sort products by featured status, then order number, then name
  const products = await Promise.all(
    searchItems.map(async (item, index) => {
      // Format price for display
      const formatPrice = (
        priceValue: number,
        currencyCode: string = 'INR',
      ) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(priceValue);
      };

      const getPriceDisplay = () => {
        if (item.priceWithTax) {
          if ('value' in item.priceWithTax) {
            // Convert paisa to rupees
            return formatPrice(Math.round(item.priceWithTax.value / 100), item.currencyCode);
          } else if ('min' in item.priceWithTax && 'max' in item.priceWithTax) {
            if (item.priceWithTax.min === item.priceWithTax.max) {
              // Convert paisa to rupees
              return formatPrice(Math.round(item.priceWithTax.min / 100), item.currencyCode);
            } else {
              return `${formatPrice(
                item.priceWithTax.min,
                item.currencyCode,
              )} - ${formatPrice(Math.round(item.priceWithTax.max / 100), item.currencyCode)}`;
            }
          }
        }
        return '₹0';
      };

      const productFacets = getProductFacetsFromIds(item.facetValueIds, collectionFacets);

      const facultyFacets = productFacets.find(facet => facet.code === 'faculty');
      let faculties: {
        code: string;
        slug: string;
        name: string;
        image: string;
      }[] = [];
      if (
        facultyFacets &&
        Array.isArray(facultyFacets.values) &&
        facultyFacets.values.length > 0
      ) {
        faculties = await Promise.all(
          facultyFacets.values.map(async (facultyFacet) => {
            const cacheKey = facultyFacet.code;
            
            // Check cache first
            if (facultyCache.has(cacheKey)) {
              return facultyCache.get(cacheKey);
            }
            
            const faculty = collectionFaculties?.find(faculty => faculty.code === cacheKey);
            
            const facultyData = {
              code: cacheKey,
              image: faculty?.image || '',
              name: faculty?.name || '',
              slug: faculty?.slug || '',
            };
            
            // Cache the result
            facultyCache.set(cacheKey, facultyData);
            
            return facultyData;
          }),
        );
      }
      // here check prodcut in productDisplayOrder and get the orderNumber and isFeatured
      const productDisplayOrderData = productDisplayOrder.find(product => product.slug === item.slug);
      const orderNumber = productDisplayOrderData?.orderNumber || 999999;
      const isFeatured = productDisplayOrderData?.isFeatured || false;
      // Get base price for percentage discount calculation
      let basePrice = 0;
      if (item.priceWithTax) {
        if ('value' in item.priceWithTax) {
          // Convert paisa to rupees
          basePrice = item.priceWithTax.value / 100;
        } else if ('min' in item.priceWithTax) {
          // Use min price for calculation (convert paisa to rupees)
          basePrice = item.priceWithTax.min / 100;
        }
      }

      const offers = JSON.parse(item.offers || '[]');
      // Calculate total discount from productDisplayOrder offers
      const totalDiscount = offers?.reduce(
        (sum: number, offer: { offerId: string; discountAmount: number; discountType: string; discountValue: number; }) => {
          if (offer?.discountType?.toLowerCase() === 'percentage' && offer?.discountValue) {
            // Calculate percentage discount: (discountValue / 100) * basePrice
            const percentageDiscount = (offer?.discountValue || 0) / 100 * basePrice;
            return sum + percentageDiscount;
          } else {
            // Fixed discount: use discountAmount directly
            return sum + (offer?.discountAmount || 0);
          }
        },
        0,
      ) || 0;
      return {
        id: item.productId || `product-${index}`,
        productId: item.productId,
        name: item.productName,
        slug: item.slug,
        image: item.productAsset?.preview || '',
        price: item.priceWithTax,
        currency: item.currencyCode,
        sellerSku: null,
        pricing: {
          current: getPriceDisplay(),
          original: undefined,
        },
        productFacets,
        faculty: faculties,
        orderNumber: orderNumber,
        isFeatured: isFeatured,
        totalDiscount: totalDiscount,
      };
    }),
  );

  // Sort products by featured status, then order number, then name
  return products.sort((a, b) => {
    // First sort by featured status (featured products first)
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }

    // Then sort by order number (lower numbers first)
    if (a.orderNumber !== b.orderNumber) {
      return a.orderNumber - b.orderNumber;
    }

    // If same order or both unordered, sort by name
    return a.name.localeCompare(b.name);
  });
}

export async function getCollectionFacets(
  collectionSlug: string,
  options: QueryOptions,
): Promise<ProcessedFacet[]> {
  const facetValuesResult = await sdk.searchFacetValues(
    {
      input: {
        groupByProduct: true,
        collectionSlug: collectionSlug,
        take: 30, // Get more facet values
      },
    },
    options,
  );
  console.log('Facet Values Result:', facetValuesResult);
  let processedFacets: ProcessedFacet[] = [];

    try {
      // Process and deduplicate facets
      processedFacets = processFacets(
        facetValuesResult?.search?.facetValues || [],
      );
    } catch (facetError) {
      console.warn('Failed to fetch facets, using empty array:', facetError);
      processedFacets = [];
    }
  return processedFacets;
}

export async function getCollectionFaculties(
  facultyFacets: ProcessedFacet,
  options: QueryOptions,
): Promise<{
  code: string;
  slug: string;
  name: string;
  image: string;
}[]> {
  // Parallelize faculty fetching with Promise.allSettled
  const facultyPromises = facultyFacets.values.map(async (faculty) => {
    try {
      const result = await getCollectionBySlug(faculty.code, options);
      return {
        code: faculty.code,
        image: result.collection?.featuredAsset?.preview || '',
        name: result.collection?.name || '',
        slug: result.collection?.slug || '',
      };
    } catch (error) {
      console.error('🔍 Error fetching faculty:', faculty.code, error);
      return {
        code: faculty.code,
        image: '',
        name: '',
        slug: '',
      };
    }
  });
  
  const facultyResults = await Promise.allSettled(facultyPromises);
  const faculties = facultyResults
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value);
  
  return faculties;
}

/**
 * Get products for top filter (no filtering, just raw collection products)
 * Uses main collection faculty data for consistency
 */
export async function getTopFilterProducts(
  collectionSlug: string,
  options: QueryOptions,
  take: number = 120,
  mainCollectionFaculties?: {
    code: string;
    slug: string;
    name: string;
    image: string;
  }[],
): Promise<ProductList> {
  try {
    // First, try to get the collection to verify it exists
    try {
      const collectionResult = await getCollectionBySlug(
        collectionSlug,
        options,
      );
      
      if (!collectionResult.collection) {
        return {
          products: [],
          totalItems: 0,
          collectionFacetValues: [],
        };
      }
    } catch (collectionError) {
      // Continue anyway, maybe the collection exists but has no products
    }
    
    // Simple search input - no filtering, just get products from collection
    const searchInput: SearchInput = {
      groupByProduct: true,
      collectionSlug: collectionSlug,
      take: take,
      inStock: true, // Only get products that are in stock
    };
    
    console.log('🔍 Top filter search input:', JSON.stringify(searchInput, null, 2));
    
    // Get products from Vendure search
    const searchPromise = sdk.search(
      {
        input: searchInput,
      },
      options,
    );
    
    // Add timeout to prevent hanging (15 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout after 15 seconds')), 15000);
    });
    
    const productsResult = await Promise.race([searchPromise, timeoutPromise]) as any;
    
    // Get collection facets for proper product facet processing
    const collectionFacets = await getCollectionFacets(collectionSlug, options);
    
    // Create product list with proper facets and faculty data
    const products = await Promise.all(
      (productsResult?.search?.items || []).map(async (item: any, index: number) => {
        // Format price for display
        const formatPrice = (
          priceValue: number,
          currencyCode: string = 'INR',
        ) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(priceValue);
        };

        const getPriceDisplay = () => {
          if (item.priceWithTax) {
            if ('value' in item.priceWithTax) {
              // Convert paisa to rupees
              return formatPrice(Math.round(item.priceWithTax.value / 100), item.currencyCode);
            } else if ('min' in item.priceWithTax && 'max' in item.priceWithTax) {
              if (item.priceWithTax.min === item.priceWithTax.max) {
                // Convert paisa to rupees
                return formatPrice(Math.round(item.priceWithTax.min / 100), item.currencyCode);
              } else {
                return `${formatPrice(
                  item.priceWithTax.min,
                  item.currencyCode,
                )} - ${formatPrice(Math.round(item.priceWithTax.max / 100), item.currencyCode)}`;
              }
            }
          }
          return '₹0';
        };

        // Get product facets from facet value IDs
        const productFacets = getProductFacetsFromIds(item.facetValueIds, collectionFacets);
        
        // Get faculty data from product facets or use main collection faculty data
        const facultyFacets = productFacets.find(facet => facet.code === 'faculty');
        let faculties: any[] = [];
        
        if (facultyFacets && Array.isArray(facultyFacets.values) && facultyFacets.values.length > 0) {
          // Use faculty data from product facets
          faculties = await Promise.all(
            facultyFacets.values.map(async (facultyFacet) => {
              const faculty = mainCollectionFaculties?.find(f => f.code === facultyFacet.code);
              return {
                code: facultyFacet.code,
                image: faculty?.image || '',
                name: faculty?.name || facultyFacet.name,
                slug: faculty?.slug || '',
              };
            }),
          );
        } else if (mainCollectionFaculties && mainCollectionFaculties.length > 0) {
          // Fallback to main collection faculty data
          faculties = mainCollectionFaculties;
        }
        
        return {
          id: item.productId || `product-${index}`,
          productId: item.productId,
          name: item.productName,
          slug: item.slug,
          image: item.productAsset?.preview || '/images/productImage.png',
          price: item.priceWithTax,
          currency: item.currencyCode,
          sellerSku: null,
          pricing: {
            current: getPriceDisplay(),
            original: undefined,
          },
          productFacets: productFacets, // Include proper product facets
          faculty: faculties,
          orderNumber: 999999,
          isFeatured: false,
        };
      }),
    );

    return {
      products: products,
      totalItems: productsResult?.search?.totalItems || 0,
      collectionFacetValues: productsResult?.search?.facetValues || [],
    };
  } catch (error) {
    console.error('Error in getTopFilterProducts:', error);
    return {
      products: [],
      totalItems: 0,
      collectionFacetValues: [],
    };
  }
}

/**
 * Get products for card with optional filtering
 */
export async function getProductsForCard(
  collectionSlug: string,
  options: QueryOptions,
  take: number = 120,
  collectionFacets?: ProcessedFacet[],
  collectionFaculties?: {
    code: string;
    slug: string;
    name: string;
    image: string;
  }[],
  productDisplayOrder?: {
    slug: string;
    orderNumber: number;
    isFeatured: boolean;
    offers: Array<{
      offerId: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
    }>;
  }[],
  mainFilterValueId?: string,
): Promise<ProductList> {
  try {
    // Build search input - get all products for client-side pagination
    const searchInput: SearchInput = {
      groupByProduct: true,
      collectionSlug: collectionSlug,
      take: take, // Get all products up to 120
      // No skip - get all products for client-side pagination
      // Add performance optimizations
      inStock: true, // Only get products that are in stock
    };
    if (mainFilterValueId) {
      searchInput.facetValueFilters = [{ or: [mainFilterValueId] }];
    }

    // Get products from Vendure search with timeout protection
    const searchPromise = sdk.search(
      {
        input: searchInput,
      },
      options,
    );
    // console.log('🔍 Search input:', JSON.stringify(searchInput, null, 2));
    // Add timeout to prevent hanging (15 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout after 15 seconds')), 15000);
    });
    
    const productsResult = await Promise.race([searchPromise, timeoutPromise]) as any;
    // console.log('🔍 Products result:', JSON.stringify(productsResult?.search?.facetValues, null, 2));
    
    const products = await createProductList(
      collectionFacets || [],
      productsResult?.search?.items || [],
      collectionFaculties || [],
      productDisplayOrder || [],
      options,
    );

    let processedFacets: ProcessedFacet[] = collectionFacets || [];
    if (mainFilterValueId) {
      try {
        // Process and deduplicate facets
        processedFacets = processFacets(
          productsResult?.search?.facetValues || [],
        );
      } catch (facetError) {
        console.warn('Failed to fetch facets, using empty array:', facetError);
        processedFacets = [];
      }
    }
    return {
      products: products,
      totalItems: productsResult?.search?.totalItems || 0,
      collectionFacetValues: processedFacets || [],
    };
  } catch (error) {
    console.error('Error in getProductsForCard:', error);
    
    // If it's a timeout error, return empty results instead of throwing
    if (error instanceof Error && error.message.includes('timeout')) {
      console.warn('Search timed out, returning empty results');
      return {
        products: [],
        totalItems: 0,
        collectionFacetValues: [],
      };
    }
    throw error;
  }
}
