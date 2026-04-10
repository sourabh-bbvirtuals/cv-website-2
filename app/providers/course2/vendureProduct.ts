import { sdk } from '~/graphqlWrapper';
import { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';
import { getProductsByIds } from '../products';

export interface VendureCourse2Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  facetProperties: { [key: string]: { name: string; value: string } };
  attemptList: Array<{ code: string; name: string }>;
  optionProperties: Array<{
    id: string;
    name: string;
    code: string;
    options: Array<{ id: string; name: string; value: string }>;
    isMode?: boolean;
    isBooks?: boolean;
  }>;
  variantProperties: Array<{
    id: string;
    name: string;
    currencyCode: string;
    priceWithTax: number;
    sku: string;
    stockLevel: number;
    options: Array<{ id: string; name: string; value: string }>;
    variantDetails?: Array<{
      subject: string;
      testSeries?: string;
      subscription?: string;
      validity?: string;
      mode?: string;
      views?: string;
      books?: string;
      note?: string;
    }>;
  }>;
  productImages: string[];
  additionalFeatures?: any;
  faculties: Array<{
    name: string;
    image: string;
    description: string;
  }>;
  priceWithTax: number;
  currencyCode: string;
  featuredAsset?: {
    preview: string;
  };
  facetValues: Array<{
    facet: {
      name: string;
    };
    name: string;
  }>;
  customFields?: {
    [key: string]: any;
  };
  variantDetails?: Array<{
    subject: string;
    testSeries?: string;
    validity?: string;
    mode?: string;
    views?: string;
    books?: string;
    note?: string;
  }>;
  sellerSku: string;
  offers: Array<{
    offerId: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  }>;
  relatedProductIds: string[];
}

// Convert Vendure product to Course2Product format
async function convertVendureProductToCourse2Product(
  vendureProduct: any,
  productSlug: string,
  options: QueryOptions,
): Promise<VendureCourse2Product> {
  // console.log('Vendure Product:', JSON.stringify(vendureProduct.variants, null, 2));
  const facetProperties: { [key: string]: { name: string; value: string } } =
    {};
  // console.log('Vendure Product Facet Values:', vendureProduct.facetValues);
  vendureProduct.facetValues.map((facet: any) => {
    const facetCode = facet.facet.code;
    const facetName = facet.facet.name;
    const facetValue = facet.name;
    facetProperties[facetCode] = {
      name: facetName,
      value: facetValue,
    };
  });
  const optionProperties = vendureProduct.optionGroups.map(
    (optionGroup: any) => {
      return {
        id: optionGroup.id,
        name: optionGroup.name,
        code: optionGroup.code,
        options: optionGroup.options,
      };
    },
  );
  const isCombo =
    (facetProperties?.['type']?.value || '').toLowerCase() === 'combo';

  // Parser to build subject details from the long variant name/options
  const parseVariantSubjectDetails = (rawText: string) => {
    if (!rawText) return [] as Array<Record<string, string>>;
    const knownKeys = [
      'test series',
      'validity',
      'mode',
      'views',
      'books',
      'subscription',
    ];
    const subjects: Array<Record<string, string>> = [];
    let current: Record<string, string> | null = null;

    const setField = (
      obj: Record<string, string>,
      key: string,
      value: string,
    ) => {
      const kn = key.trim().toLowerCase();
      const v = value.trim();
      if (!v) return;
      if (kn === 'test series') obj.testSeries = v;
      else if (kn === 'validity') obj.validity = v;
      else if (kn === 'mode') obj.mode = v;
      else if (kn === 'views')
        obj.views = v.replace(/\s*views?$/i, '').trim() + ' Views';
      else if (kn === 'books') obj.books = v;
      else if (kn === 'subscription') obj.subscription = v;
    };

    // Split by comma and process each token
    const tokens = rawText
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const hasColon = token.includes(':');

      if (!hasColon) {
        // Token has no colon - it's part of the subject name
        if (!current) {
          // Start new subject
          current = { subject: token };
          subjects.push(current);
        } else {
          // Append to current subject name
          current.subject = (current.subject + ', ' + token).trim();
        }
      } else {
        // Token has colon
        const colonIndex = token.indexOf(':');
        const beforeColon = token.substring(0, colonIndex).trim();
        const afterColon = token.substring(colonIndex + 1).trim();
        const isKnownKey = knownKeys.includes(beforeColon.toLowerCase());

        if (isKnownKey) {
          // This is a key-value pair for current subject
          if (current) {
            setField(current, beforeColon, afterColon);
          }
        } else {
          // This is a new subject (subject name before colon)
          // If previous token had no colon, it was part of this subject name - combine them
          if (i > 0 && !tokens[i - 1].includes(':')) {
            // Previous token was part of subject name
            if (current) {
              current.subject = (current.subject + ', ' + beforeColon).trim();
            } else {
              current = { subject: beforeColon };
              subjects.push(current);
            }
          } else {
            // Start a new subject
            current = { subject: beforeColon };
            subjects.push(current);
          }

          // Process the value after colon (might contain another key-value pair like "Views:5 Views")
          const secondColonIndex = afterColon.indexOf(':');
          if (secondColonIndex !== -1) {
            const secondKey = afterColon.substring(0, secondColonIndex).trim();
            const secondValue = afterColon
              .substring(secondColonIndex + 1)
              .trim();
            if (knownKeys.includes(secondKey.toLowerCase())) {
              setField(current, secondKey, secondValue);
            }
          }
        }
      }
    }
    return subjects as Array<{
      subject: string;
      testSeries?: string;
      validity?: string;
      mode?: string;
      views?: string;
      books?: string;
      note?: string;
      subscription?: string;
    }>;
  };

  const variantProperties = vendureProduct.variants.map((variant: any) => {
    const raw = (variant.options && variant.options[0]?.name) || variant.name;
    const variantDetails = isCombo ? parseVariantSubjectDetails(raw) : [];
    return {
      id: variant.id,
      name: variant.name,
      currencyCode: variant.currencyCode,
      priceWithTax: variant.priceWithTax,
      sku: variant.sku,
      stockLevel: variant.stockLevel,
      options: variant.options,
      variantDetails,
    };
  });

  // Refine option properties to handle "Mode" and "Books" correctly.
  // We want to avoid merging "Soft Copy/Hard Copy" into the "Mode" dropdown
  // if they are separate in Vendure, and ensure correct labels.
  const refinedOptionProperties = optionProperties.map((op) => {
    const code = String(op.code || '').toLowerCase();
    const name = String(op.name || '').toLowerCase();

    // Check if this is a "Mode" related group
    const isMode = code === 'mode' || name === 'mode' || name.includes('mode');
    // Check if this is a "Books" related group
    const isBooks =
      code === 'book' ||
      code === 'books' ||
      name === 'book' ||
      name === 'books' ||
      name.includes('book');

    const processedOptions = op.options.map((opt: any) => {
      const n = String(opt.name || '').toLowerCase();
      const v = String(opt.value || '').toLowerCase();

      let displayName = opt.name;
      if (n.includes('soft') || v.includes('soft')) displayName = 'Soft Copy';
      else if (n.includes('hard') || v.includes('hard'))
        displayName = 'Hard Copy';
      else if (n.includes('recorded') || v.includes('recorded'))
        displayName = 'Recorded';
      else if (n.includes('live') || v.includes('live')) displayName = 'Live';

      return {
        ...opt,
        name: displayName,
        value: displayName,
      };
    });

    return {
      ...op,
      options: processedOptions,
      isMode,
      isBooks,
    };
  });

  // Build options for the "Attempt" dropdown shown in ProductForm.
  // Some products store the month/batch applicability under different facet codes
  // (e.g. `attempt`, `attempt-cma`, and `examAttempt`).
  const ATTEMPT_FACET_CODES = new Set([
    'attempt',
    'attempt-cma',
    'examAttempt',
  ]);

  const attemptList: Array<{ code: string; name: string }> = Array.from(
    new Map(
      (vendureProduct.facetValues || [])
        .filter((facet: any) => ATTEMPT_FACET_CODES.has(facet?.facet?.code))
        .map((facet: any) => [
          // Deduplicate by display name
          String(facet?.name || ''),
          {
            code: String(facet?.facet?.code || ''),
            name: String(facet?.name || ''),
          },
        ])
        .filter(([, item]) => Boolean(item.name)),
    ).values(),
  );
  // console.log('Attempt List:', attemptList);

  // Extract price information
  const priceWithTax = vendureProduct.variants?.[0]?.priceWithTax || 0;
  const currencyCode = vendureProduct.variants?.[0]?.currencyCode || 'INR';

  // Fetch faculty data from facets (similar to createProductList)
  let facultyData: Array<{
    name: string;
    image: string;
    description: string;
  }> = [];

  try {
    // Find faculty facets in the product
    const facultyFacets =
      vendureProduct.facetValues?.filter(
        (facet: any) => facet.facet.code === 'faculty',
      ) || [];

    // console.log('🔍 Faculty Facets Found:', facultyFacets);

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

  // Enrich faculty data from specifications' our_faculty section when
  // collection-based images are missing
  try {
    const customDataRaw = vendureProduct.customFields?.customData;
    if (customDataRaw) {
      const parsed =
        typeof customDataRaw === 'string'
          ? JSON.parse(customDataRaw)
          : customDataRaw;
      const specs = parsed?.specifications?.product ?? (Array.isArray(parsed) ? parsed : []);
      const facultySpec = specs.find(
        (s: any) => s.identifier === 'our_faculty',
      );
      const facultyInfos: Array<{ name?: string; imageUrl?: string; description?: string }> =
        facultySpec?.facultyInfos ?? [];

      if (facultyInfos.length > 0) {
        if (facultyData.length === 0) {
          facultyData = facultyInfos.map((f) => ({
            name: f.name || 'Faculty',
            image: f.imageUrl || '',
            description: f.description || '',
          }));
        } else {
          // Fill in missing images from spec data
          for (const fd of facultyData) {
            if (!fd.image) {
              const match = facultyInfos.find(
                (f) => f.name && f.name.toLowerCase() === fd.name.toLowerCase(),
              );
              if (match?.imageUrl) fd.image = match.imageUrl;
            }
          }
        }
      }
    }
  } catch {
    // non-fatal
  }

  return {
    id: vendureProduct.id,
    title: vendureProduct.name,
    slug: productSlug,
    description: vendureProduct.description || '',
    facetProperties,
    attemptList,
    optionProperties: refinedOptionProperties,
    productImages:
      vendureProduct.assets?.map((asset: any) => asset.preview) ||
      [vendureProduct.featuredAsset?.preview].filter(Boolean),
    additionalFeatures: vendureProduct.customFields?.additionalFeatures
      ? JSON.parse(vendureProduct.customFields?.additionalFeatures)
      : null,
    variantProperties,
    priceWithTax,
    currencyCode,
    featuredAsset: vendureProduct.featuredAsset,
    facetValues: vendureProduct.facetValues || [],
    customFields: vendureProduct.customFields || {},
    faculties: facultyData,
    variantDetails: isCombo
      ? variantProperties[0]?.variantDetails || []
      : undefined,
    sellerSku: vendureProduct.customFields?.sellerSku || '',
    offers: vendureProduct.customFields?.offers
      ? JSON.parse(vendureProduct.customFields?.offers)
      : [],
    relatedProductIds: vendureProduct.customFields?.relatedProductIds || [],
  };
}

// Main function to get product by slug from Vendure
export async function getProductBySlug(
  productSlug: string,
  options: QueryOptions,
): Promise<VendureCourse2Product | null> {
  try {
    console.log('=== getCourse2ProductBySlugFromVendure ===');
    console.log('Product Slug:', productSlug);
    console.log('==============================');

    // Fetch product from Vendure
    let result = await sdk.product({ slug: productSlug }, options);
    // console.log('Vendure Product Data1:', JSON.stringify(result || {}, null, 2));
    // const relatedProducts = await getProductsByIds(result.product?.customFields?.relatedProductIds || [], options);
    if (!result.product) {
      // console.log('Product not found in Vendure:', productSlug);
      const result2 = await sdk.products(
        { options: { filter: { slug: { eq: productSlug } }, take: 1 } },
        options,
      );

      // console.log('Vendure Product Data2:', JSON.stringify(result2, null, 2));
      if (
        result2.products.totalItems > 0 &&
        result2.products.items.length > 0
      ) {
        // Create a new result object with the same structure as the original query
        result = {
          ...result,
          product: result2.products.items[0],
        };
      } else {
        return null;
      }
    }

    // console.log('Vendure Product Data:', JSON.stringify(result, null, 2));

    // Convert Vendure product to Course2Product format
    const course2Product = await convertVendureProductToCourse2Product(
      result.product,
      productSlug,
      options,
    );

    // console.log('Converted Course2Product:', JSON.stringify(course2Product.variantProperties, null, 2));
    // console.log('==============================');

    return course2Product;
  } catch (error) {
    console.error('Error fetching product from Vendure:', error);
    return null;
  }
}
