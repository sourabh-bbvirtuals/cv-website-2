import gql from 'graphql-tag';
import { QueryOptions, sdk } from '../../graphqlWrapper';
import {
  GetFacetValuesQueryVariables,
  SearchQueryVariables,
} from '~/generated/graphql';

export function getFacetValues(
  variables: GetFacetValuesQueryVariables,
  options?: QueryOptions,
) {
  return sdk.getFacetValues(variables, options);
}

export function search(variables: SearchQueryVariables, options: QueryOptions) {
  return sdk.search(variables, options);
}

export function searchFacetValues(
  variables: SearchQueryVariables,
  options: QueryOptions,
) {
  return sdk.searchFacetValues(variables, options);
}

export async function getProductBySlug(slug: string, options: QueryOptions) {
  const r = await sdk.product({ slug }, options);
  return r;
}

// Efficient batch fetch of products with custom fields
export async function getProductsByIds(
  productIds: string[],
  options: QueryOptions,
) {
  // console.log("🔍 getProductsWithCustomFields called with:", productIds);

  // Filter out null/undefined values and ensure we have valid IDs
  const validProductIds = productIds.filter(
    (id) => id && typeof id === 'string' && id.trim() !== '',
  );
  // console.log("🔍 Valid product IDs:", validProductIds);

  // If no valid IDs, return empty result
  if (validProductIds.length === 0) {
    console.log('🔍 No valid product IDs, returning empty result');
    return {
      products: {
        totalItems: 0,
        items: [],
      },
    };
  }

  const result = await sdk.products(
    {
      options: {
        filter: { id: { in: validProductIds } },
        take: validProductIds.length,
      },
    },
    options,
  );
  return result;
}

export async function getProducts(options: QueryOptions, listOptions?: any) {
  const result = await sdk.products(
    {
      options: listOptions || { take: 100 },
    },
    options,
  );
  return result;
}

export async function getProductByVariantId(
  variantId: string,
  options: QueryOptions,
) {
  return await sdk.productByVariantId({ variantId }, options);
}

export const detailedProductFragment = gql`
  fragment DetailedProductManual on Product {
    id
    name
    slug
    description
    customFields {
      customData
    }
    collections {
      id
      slug
      name
      # customFields {
      #   customData
      # }
      breadcrumbs {
        id
        name
        slug
      }
    }
    facetValues {
      facet {
        id
        code
        name
      }
      id
      code
      name
    }
    featuredAsset {
      id
      preview
    }
    assets {
      id
      preview
    }
    optionGroups {
      id
      name
      code
      options {
        id
        name
      }
    }
    variants {
      id
      name
      priceWithTax
      currencyCode
      sku
      stockLevel
      options {
        id
        name
        group {
          id
          name
        }
      }
      featuredAsset {
        id
        preview
      }
    }
  }
`;

gql`
  query product($slug: String, $id: ID) {
    product(slug: $slug, id: $id) {
      ...DetailedProductManual
    }
  }
`;

export const listedProductFragment = gql`
  fragment ListedProduct on SearchResult {
    productId
    productName
    description
    slug
    productVariantId
    productVariantName
    sku
    facetValueIds
    productAsset {
      id
      preview
    }
    currencyCode
    priceWithTax {
      ... on PriceRange {
        min
        max
      }
      ... on SinglePrice {
        value
      }
    }
    # offers
  }
`;

gql`
  query search($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        ...ListedProduct
      }
      facetValues {
        count
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
  ${listedProductFragment}
`;

gql`
  query searchFacetValues($input: SearchInput!) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
  ${listedProductFragment}
`;

gql`
  query products($options: ProductListOptions) {
    products(options: $options) {
      totalItems
      items {
        ...DetailedProductManual
      }
    }
  }
  ${detailedProductFragment}
`;

gql`
  query productByVariantId($variantId: ID!) {
    getProductByVariantId(variantId: $variantId) {
      id
      name
      slug
      # customFields {
      #   # language
      #   # additionalFeatures
      #   # sellerSku
      #   # ByFaculty
      # }
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
      variants {
        id
        name
        priceWithTax
        currencyCode
        sku
        stockLevel
      }
    }
  }
`;

gql`
  query getFacetValues {
    facets(options: { take: 100 }) {
      items {
        id
        name
        code
        valueList {
          items {
            id
            code
            name
          }
        }
      }
      totalItems
    }
  }
`;
