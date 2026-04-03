import { getCollectionBySlug } from '~/providers/collections/collections';
import { Collection, SearchInput } from '~/gql/graphql';
import { QueryOptions, sdk } from '~/graphqlWrapper';
import { ProcessedFacet, processFacets } from '~/providers/products/productsWithFacets';

export interface CollectionData {
  id: string;
  name: string;
  slug: string;
  profileImageUrl: string;
  hero?: {
    heading?: string;
    subheading?: string;
    intro?: string;
  };
  customProducts?: {
    products?: Array<any>;
    combo?: any;
  };
  banners: Array<any>;
  pageRules: Record<string, any>;
  productDisplayOrder: Array<any>;
  topCollectionFilter: Array<{
    mainFilter: Collection;
    subFilters: Collection[];
  }>;
  filterSequenceCategory?: string;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    customFields?: {
      customData?: string;
    };
  }>;
  parent?: {
    id: string;
    name: string;
    slug: string;
    children?: Array<{
      id: string;
      name: string;
      slug: string;
      customFields?: {
        customData?: string;
      };
    }>;
  };
}

export interface EventCollectionProduct {
  slug: string;
  productId: string;
  productName: string;
  productVariantId: string;
  productVariantSku: string;
  productVariantName: string;
  description: string;
  facetValueIds: string[];
  productAsset: {
    id: string;
    preview: string;
  };
  currencyCode: string;
  priceWithTax: {
    min: number;
    max: number;
  };
  price: number;
  faculty: Array<{
    slug: string;
    name: string;
    image: string;
  }>;
}

export interface EventCollectionProducts {
  products: EventCollectionProduct[];
  collectionFacets: ProcessedFacet[];
  facultyFacet?: ProcessedFacet;
  attemptFacet?: ProcessedFacet;
  totalItems: number;
}

/**
 * Shared function to get collection data (banners, display name, and page rules)
 * Used by products2, faculty2, and courses2 pages
 */
export async function getCollectionData(
  collectionSlug: string,
  options: { request: Request },
): Promise<CollectionData | null> {
  try {
    const result = await sdk.getCollectionWithChildren({ slug: collectionSlug }, options);
    if (result.collection === null) return null;
    console.log('result', result);
    const pageRules = JSON.parse(
      result.collection?.customFields?.pageRules || '{}',
    );
    
    let topCollectionFilter: Array<{
      mainFilter: Collection;
      subFilters: Collection[];
    }> = [];
    if (pageRules.filter?.topFilter && pageRules.filter?.topFilterType === 'collection') {
      const firstLayerFilter = result.collection?.children;
      if (firstLayerFilter && firstLayerFilter.length > 0) {
        topCollectionFilter = await Promise.all(
          firstLayerFilter
            .filter((f: any) => !!f?.slug)
            .map(async (filter: any) => {
              const filterResult = await getCollectionBySlug(
                filter.slug,
                options,
              );
              return {
                mainFilter: filter as Collection,
                subFilters: (filterResult.collection?.children ??
                  []) as Collection[],
              };
            }),
        );
      }
    }
    if (!result.collection?.customFields?.customData) {
      // Type cast children properly to include customFields
      const children = (result.collection?.children || []).map((child: any) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        customFields: child.customFields ? {
          customData: child.customFields.customData
        } : undefined
      }));
      
      // Transform parent to match expected type
      const parent = result.collection?.parent ? {
        id: result.collection.parent.id,
        name: result.collection.parent.name,
        slug: result.collection.parent.slug,
        children: result.collection.parent.children
          ? result.collection.parent.children.map((child: any) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
              customFields: child.customFields ? {
                customData: child.customFields.customData
              } : undefined
            }))
          : undefined
      } : undefined;
      
      return {
        id: result.collection?.id || collectionSlug,
        name: result.collection?.name || collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1),
        slug: result.collection?.slug || collectionSlug,
        profileImageUrl: result.collection?.featuredAsset?.preview || '',
        banners: [],
        pageRules: pageRules,
        productDisplayOrder: result.collection?.customFields?.productDisplayOrder ? JSON.parse(result.collection?.customFields?.productDisplayOrder) : [],
        topCollectionFilter,
        children: children,
        parent: parent,
      };
    }
    
    const productDisplayOrder =
      JSON.parse(result.collection.customFields?.productDisplayOrder || '[]') ||
      [];
    const collectionData = JSON.parse(
      result.collection.customFields.customData,
    );
    const bannersArray = Array.isArray(collectionData.banners)
      ? collectionData.banners
      : Array.isArray(collectionData)
      ? collectionData
      : [];

    // Type cast children properly to include customFields
    const children = (result.collection?.children || []).map((child: any) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      customFields: child.customFields ? {
        customData: child.customFields.customData
      } : undefined
    }));

    // Transform parent to match expected type
    const parent = result.collection?.parent ? {
      id: result.collection.parent.id,
      name: result.collection.parent.name,
      slug: result.collection.parent.slug,
      children: result.collection.parent.children
        ? result.collection.parent.children.map((child: any) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            customFields: child.customFields ? {
              customData: child.customFields.customData
            } : undefined
          }))
        : undefined
    } : undefined;

    return {
      id: result.collection?.id || collectionSlug,
      name: collectionData.name || result.collection?.name || collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1),
      slug: result.collection?.slug || collectionSlug,
      profileImageUrl: result.collection?.featuredAsset?.preview || '',
      hero: collectionData.hero || '',
      customProducts: {
        products: collectionData.products || [],
        combo: collectionData.combo || undefined,
      },
      filterSequenceCategory: collectionData.filterSequenceCategory || null,
      banners: bannersArray,
      pageRules: pageRules,
      productDisplayOrder: productDisplayOrder,
      topCollectionFilter,
      children: children,
      parent: parent,
    };
  } catch (error) {
    console.warn('Failed to get collection data:', error);
    return {
      id: collectionSlug,
      name: collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1),
      slug: collectionSlug,
      profileImageUrl: '',
      banners: [],
      pageRules: {},
      productDisplayOrder: [],
      topCollectionFilter: [],
      children: [],
      parent: undefined,
    };
  }
}

export async function getEventCollectionProducts(
  collectionSlug: string,
  options: QueryOptions,
  take: number = 120,
): Promise<EventCollectionProducts> {
  try {
    // Build search input - get all products for client-side pagination
    const searchInput: SearchInput = {
      groupByProduct: true,
      collectionSlug: collectionSlug,
      take: take,
      inStock: true, // Only get products that are in stock
    };

    // Get products from Vendure search with timeout protection
    const searchResult = await sdk.search(
      {
        input: searchInput,
      },
      options,
    );
    const searchItems = searchResult.search.items;
    const facetValues = searchResult.search.facetValues;
    const totalItems = searchResult.search.totalItems;
    const products: EventCollectionProduct[] = [];
    searchItems.forEach((item: any) => {
      products.push({
        slug: item.slug,
        productId: item.productId,
        productName: item.productName,
        productVariantId: item.productVariantId,
        productVariantSku: item.sku,
        productVariantName: item.productVariantName,
        description: item.description,
        facetValueIds: item.facetValueIds,
        productAsset: {
          id: item.productAsset?.id || '',
          preview: item.productAsset?.preview || ''
        },
        currencyCode: item.currencyCode || '',
        priceWithTax: item.priceWithTax || { min: 0, max: 0 },
        price: item.priceWithTax?.min ? Math.round(item.priceWithTax.min / 100) : 0, // Convert from paise to rupees
        faculty: []
      });
    });
    const collectionFacets = processFacets(facetValues);
    console.log('Collection Facets1:', collectionFacets);
    return {
      products,
      collectionFacets,
      facultyFacet: collectionFacets.find((facet) => facet.code === 'faculty') || undefined,
      attemptFacet: collectionFacets.find((facet) => facet.code === 'attempt') || undefined,
      totalItems,
    };
  } catch (error) {
    console.error('Error in getProductsForCard:', error);
    
    // If it's a timeout error, return empty results instead of throwing
    if (error instanceof Error && error.message.includes('timeout')) {
      console.warn('Search timed out, returning empty results');
      return {
        products: [],
        collectionFacets: [],
        totalItems: 0,
      };
    }
    throw error;
  }
}