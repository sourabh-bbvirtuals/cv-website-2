import {
  addItemToOrder,
  getActiveOrder,
  addItemsToOrder,
} from '~/providers/orders/order';
import { sdk, type QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';
import { Discount, Product, ProductVariant } from '~/generated/graphql';
import { VendureCourse2Product } from '../course2/vendureProduct';
import { getProductsByIds } from '../products';

// Types for cart functionality
export interface CartItemFaculty {
  name: string;
  image: string;
  description: string;
}
export interface CartItemRelatedProductDetails {
  id: string;
  variantId: string;
  name: string;
  variant: ProductVariant;
  slug: string;
  description: string;
  sellerSku?: string;
  faculties: Array<{
    name: string;
    image: string;
    description: string;
  }>;
  price: number;
  currencyCode: string;
}

export interface CartItemRelatedProduct {
  variantId: string;
  product: CartItemRelatedProductDetails;
}

export interface CartItem {
  id: string;
  productVariantId: string;
  quantity: number;
  productName: string;
  variantName?: string;
  sku: string;
  price: number;
  totalPrice: number;
  currency: string;
  image?: string;
  slug: string;
  additionalInformation?: {
    faculty?: CartItemFaculty[];
    mobile?: string;
    [key: string]: any;
  };
  relatedProducts?: CartItemRelatedProduct[];
}

export interface CartData {
  id?: string;
  sku?: string;
  code?: string;
  items: CartItem[];
  discounts: Discount[];
  subtotal: number;
  total: number;
  currency: string;
  state: string;
  couponCodes?: string[];
  promotions?: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    couponCode: string;
  }>;
}

export interface ProductCartInfo {
  slug: string;
  id: string;
  name: string;
  faculty: CartItemFaculty[];
  variantName?: string;
  mobile?: string;
  attempt?: string;
  offers: Array<{ offerId: string; discountAmount: number }>;
  sellerSku?: string;
  relatedProductIds?: string[];
}

/**
 * Add a product to the shopping cart with faculty information
 */
export async function addProductToCart(
  productVariantId: string,
  quantity: number = 1,
  options: QueryOptions,
  productInfo?: ProductCartInfo,
): Promise<CartData | null> {
  try {
    console.log('=== Adding Product to Cart ===');
    console.log('Product Variant ID:', productVariantId);
    console.log('Quantity:', quantity);
    console.log('Product Info:', productInfo);

    // Validate request object
    if (!options.request) {
      console.error('Request object is required for cart operations');
      return null;
    }

    // Prepare additional information for the order line
    const additionalInfo = productInfo
      ? {
          faculty: productInfo.faculty,
          mobile: productInfo.mobile,
          attempt: productInfo.attempt,
          offers: productInfo.offers,
          sellerSku: productInfo.sellerSku,
          relatedProductIds: productInfo.relatedProductIds,
        }
      : undefined;

    console.log('=== Additional Info Debug ===');
    console.log('Product Info:', productInfo);
    console.log('Additional Info:', additionalInfo);
    console.log(
      'Additional Info JSON:',
      additionalInfo ? JSON.stringify(additionalInfo) : 'undefined',
    );

    // Add item to Vendure order with custom fields
    const result = await addItemToOrder(productVariantId, quantity, options, {
      additionalInformation: additionalInfo
        ? JSON.stringify(additionalInfo)
        : undefined,
    });
    console.log('Vendure order result:', result);

    if (result.addItemToOrder?.__typename === 'Order') {
      const cartData = convertOrderToCartData(result.addItemToOrder);
      console.log('Successfully added to cart:', cartData);
      return cartData;
    } else {
      console.error('Failed to add item to cart:', result.addItemToOrder);
      return null;
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return null;
  }
}

/**
 * Add multiple products to the shopping cart with faculty information
 */
export async function addProductsToCart(
  items: Array<{
    productVariantId: string;
    quantity?: number;
    productInfo?: ProductCartInfo;
  }>,
  options: QueryOptions,
): Promise<CartData | null> {
  try {
    console.log('=== Adding Multiple Products to Cart ===');
    console.log('Total items:', items.length);
    console.log('Items:', items);

    // Validate request object
    if (!options.request) {
      console.error('Request object is required for cart operations');
      return null;
    }

    // Prepare items for addItemsToOrder
    const addItemInputs = items.map((item) => {
      // Format additionalInformation similar to addProductToCart
      const additionalInfo = item.productInfo
        ? {
            faculty: item.productInfo.faculty,
            mobile: item.productInfo.mobile,
            attempt: item.productInfo.attempt,
          }
        : undefined;

      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity || 1,
        customFields: {
          additionalInformation: additionalInfo
            ? JSON.stringify(additionalInfo)
            : undefined,
        },
      };
    });

    console.log('=== Add Items Inputs ===');
    console.log('Inputs:', addItemInputs);

    // Add items to Vendure order with custom fields
    const result = await addItemsToOrder(addItemInputs, options);
    console.log('Vendure order result:', result);
    const addItemsResult = result.addItemsToOrder as any;
    if (addItemsResult.order && addItemsResult.order.__typename === 'Order') {
      const cartData = convertOrderToCartData(addItemsResult.order);
      console.log('Successfully added items to cart:', cartData);
      return cartData;
    }
    if (
      addItemsResult?.errorResults?.__typename ===
      'UpdateMultipleOrderItemsResult'
    ) {
      // Check for errors
      if (
        addItemsResult.errorResults &&
        addItemsResult.errorResults.length > 0
      ) {
        console.error(
          'Errors adding items to cart:',
          addItemsResult.errorResults,
        );
        return null;
      }
    }

    console.error('Failed to add items to cart:', result.addItemsToOrder);
    return null;
  } catch (error) {
    console.error('Error adding products to cart:', error);
    return null;
  }
}

/**
 * Retrieve the current shopping cart with faculty information
 */
export async function getCurrentCart(
  options: QueryOptions,
): Promise<CartData | null> {
  try {
    console.log('=== Retrieving Current Cart ===');

    // Validate request object
    if (!options.request) {
      console.error('Request object is required for cart operations');
      return null;
    }

    // Get active order from Vendure
    const activeOrder = await getActiveOrder(options);
    // console.log('Active order retrieved:', activeOrder);

    if (activeOrder) {
      const cartData = convertOrderToCartData(activeOrder);
      console.log('Cart data converted successfully');
      return cartData;
    }

    console.log('No active cart found');
    return null;
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return null;
  }
}

export async function getRelatedProductsMapping(
  options: QueryOptions,
): Promise<{ [variantId: string]: string[] } | null> {
  try {
    console.log('=== Retrieving Related Products ===');
    const result = await getCollectionBySlug('related-products', options);
    if (!result.collection) {
      console.error('No collection found');
      return null;
    }
    if (!result.collection?.customFields?.customData) {
      console.error('No custom data found');
      return null;
    }
    const customData = JSON.parse(
      result.collection?.customFields?.customData || '{}',
    );
    const productMapping = customData.productMapping;
    if (!productMapping) {
      console.error('No product mapping found');
      return null;
    }
    console.log('Related products retrieved:', productMapping);
    return productMapping;
  } catch (error) {
    console.error('Error retrieving related products mapping:', error);
    return null;
  }
}

export async function getRelatedProductDetails(
  variantId: string,
  product: Product,
  options: QueryOptions,
): Promise<CartItemRelatedProductDetails | null> {
  try {
    console.log('=== getRelatedProductDetails ===');
    // console.log('Product:', product);
    console.log('==============================');
    const variant = product.variants.find(
      (variant) => variant.id === variantId,
    );
    if (!variant) {
      console.error('Variant not found');
      return null;
    }
    let facultyData: Array<{
      name: string;
      image: string;
      description: string;
    }> = [];

    try {
      // Find faculty facets in the product
      const facultyFacets =
        product.facetValues?.filter(
          (facet: any) => facet.facet.code === 'faculty',
        ) || [];

      if (facultyFacets.length > 0) {
        const facultyCache = new Map<string, any>();

        facultyData = await Promise.all(
          facultyFacets.map(async (facultyFacet: any) => {
            const cacheKey = facultyFacet.code;

            if (facultyCache.has(cacheKey)) {
              return facultyCache.get(cacheKey);
            }

            const result = await getCollectionBySlug(cacheKey, options);

            const facultyInfo = {
              name: result.collection?.name || facultyFacet.name || 'Faculty',
              image: result.collection?.featuredAsset?.preview || '',
              description: result.collection?.description || '',
            };

            facultyCache.set(cacheKey, facultyInfo);

            return facultyInfo;
          }),
        );
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      facultyData = [];
    }
    console.log('==============================');

    return {
      id: product.id,
      name: product.name,
      variantId: variant.id,
      variant: variant,
      slug: product.slug,
      description: product.description || '',
      sellerSku: product.customFields?.sellerSku || '',
      faculties: facultyData,
      price: variant.priceWithTax,
      currencyCode: variant.currencyCode,
    };
  } catch (error) {
    console.error('Error fetching product from Vendure:', error);
    return null;
  }
}

export async function getRelatedProductsDetails(
  cartItems: CartItem[],
  options: QueryOptions,
): Promise<CartItemRelatedProductDetails[] | null> {
  try {
    console.log('=== getRelatedProductsDetails ===');
    const productIds =
      cartItems && cartItems.length > 0
        ? cartItems
            .flatMap((item: CartItem) => {
              const relatedIds = item.additionalInformation?.relatedProductIds;
              if (!relatedIds) return [];
              // Handle both array of arrays and flat array cases
              return Array.isArray(relatedIds[0])
                ? relatedIds.flat()
                : relatedIds;
            })
            .filter((id): id is string => id != null && id !== '')
        : [];
    const productsByIds = await getProductsByIds(productIds, options);
    const relatedProducts: CartItemRelatedProductDetails[] = [];
    for (const product of productsByIds.products.items) {
      product.variants.forEach((variant: any) => {
        relatedProducts.push({
          id: product.id,
          variantId: variant.id,
          name: product.name,
          variant: variant,
          slug: product.slug,
          description: product.description || '',
          sellerSku: product.customFields?.sellerSku || '',
          price: variant.priceWithTax,
          currencyCode: variant.currencyCode,
          faculties: [],
        });
      });
    }

    return relatedProducts;
  } catch (error) {
    console.error('Error fetching product from Vendure:', error);
    return null;
  }
}
/**
 * Convert Vendure Order to CartData format with faculty information
 */
function convertOrderToCartData(order: any): CartData {
  console.log('=== Converting Order to Cart Data ===');
  // console.log('Order:', order);
  // console.log('Order lines:', JSON.stringify(order.lines));

  const items: CartItem[] =
    order.lines?.map((line: any) => {
      console.log('Processing line:', line);
      console.log('Line custom fields:', line.customFields);

      // Parse additional information from custom fields
      let additionalInfo: any = null;
      let facultyData: CartItemFaculty[] = [];

      if (line.customFields?.additionalInformation) {
        console.log(
          'Found additional information:',
          line.customFields.additionalInformation,
        );
        try {
          additionalInfo = JSON.parse(line.customFields.additionalInformation);
          facultyData = additionalInfo.faculty || [];
          // console.log('Parsed additional info:', additionalInfo);
          // console.log('Parsed faculty data:', facultyData);
        } catch (error) {
          console.error('Error parsing additional information:', error);
        }
      } else {
        console.log('No additional information found in custom fields');
      }

      return {
        id: line.id,
        slug: line.productVariant.product?.slug,
        productVariantId: line.productVariant.id,
        sku: line.productVariant.sku,
        quantity: line.quantity,
        productName:
          line.productVariant.product?.name || line.productVariant.name,
        variantName: line.productVariant?.name,
        price: line.unitPriceWithTax,
        totalPrice: line.linePriceWithTax,
        currency: order.currencyCode,
        image:
          line.featuredAsset?.preview ||
          line.productVariant?.featuredAsset?.preview ||
          line.productVariant?.product?.featuredAsset?.preview,
        additionalInformation: additionalInfo,
      };
    }) || [];

  return {
    id: order.id,
    code: order.code,
    items,
    discounts: order.discounts,
    subtotal: order.subTotalWithTax,
    total: order.totalWithTax,
    currency: order.currencyCode,
    state: order.state,
    couponCodes: order.couponCodes || [],
    promotions: order.promotions || [],
  };
}

/**
 * Format price for display in Indian Rupees
 * @param price - Price in paise (cents)
 * @param currency - Currency code (default: INR)
 * @param reduceByOne - Whether to reduce the price by Rs. 1 for display (default: false)
 */
export function formatPrice(
  price: number,
  currency: string = 'INR',
  reduceByOne: boolean = false,
): string {
  let adjustedPrice = price;
  if (reduceByOne) {
    adjustedPrice = adjustPrice(price, reduceByOne);
  }
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(adjustedPrice / 100); // Vendure prices are in cents
}

export function adjustPrice(
  price: number,
  reduceByOne: boolean = false,
): number {
  // Subtract Rs. 1 (100 paise) from display price only for individual items
  const adjustedPrice = reduceByOne ? Math.max(0, price - 100) : price;
  return adjustedPrice;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use formatPrice instead
 */
export const formatVendurePrice = formatPrice;

/**
 * Legacy export for backward compatibility
 * @deprecated Use getCurrentCart instead
 */
export const getVendureCart = getCurrentCart;
