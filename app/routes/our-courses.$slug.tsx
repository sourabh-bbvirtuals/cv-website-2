import { json, type DataFunctionArgs } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { getProductBySlug } from '~/providers/course2';
import { getCollectionBySlug } from '~/providers/collections/collections';
import sanitizeHtml from 'sanitize-html';
import { API_URL } from '~/constants';
import CourseDetailPage from '~/components/our-courses/CourseDetailPage';

/**
 * Course detail (Figma: 3_Course Details, node 1:1387)
 * Example: /our-courses/class-12-commerce-mh-board-batch
 *
 * Fetches:
 *  1. Product from Vendure by slug for pricing / faculty data
 *  2. Collection with the same slug for specifications JSON stored in
 *     customFields.customData
 */
export async function loader({ params, request }: DataFunctionArgs) {
  const { slug } = params;
  if (!slug) throw new Response('Not Found', { status: 404 });

  // Normalize slug: Vendure slugs almost always use hyphens,
  // but URLs might contain spaces/percent-encoded spaces.
  const normalizedSlug = slug.trim().replace(/\s+/g, '-').toLowerCase();

  try {
    // Fetch product + collection in parallel using normalized slug
    const [productResult, collectionResult] = await Promise.allSettled([
      getProductBySlug(normalizedSlug, { request }),
      getCollectionBySlug(normalizedSlug, { request }),
    ]);

    // ─── Product ────────────────────────────────────────────────────────────
    const product =
      productResult.status === 'fulfilled' ? productResult.value : null;

    // ─── Specifications (Priority: Product customFields -> Collection customFields) ──
    let specifications: any = null;

    const findSpecs = (raw: string | undefined | null) => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return { product: parsed };
        return parsed?.specifications ?? parsed ?? null;
      } catch {
        return null;
      }
    };

    // 1. Try Product's specifications
    // Direct GraphQL fetch for specifications as a workaround for SDK codegen issues
    try {
      const gqlResponse = (await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query getProductSpecs($slug: String!) {
              product(slug: $slug) {
                customFields {
                  customData
                }
              }
            }
          `,
          variables: { slug: normalizedSlug },
        }),
      }).then((res) => res.json())) as {
        data?: { product?: { customFields?: { customData?: string } } };
      };

      const directSpecs = gqlResponse?.data?.product?.customFields?.customData;
      if (directSpecs) {
        specifications = findSpecs(directSpecs);
      }
    } catch (e) {
      console.error('Error in direct specifications fetch:', e);
    }

    if (!specifications) {
      specifications = findSpecs(product?.customFields?.customData);
    }

    // 2. Fallback to Collection's customData
    if (!specifications && collectionResult.status === 'fulfilled') {
      specifications = findSpecs(
        collectionResult.value?.collection?.customFields?.customData,
      );
    }

    // ─── Sanitize description ───────────────────────────────────────────────
    const safeDescription = product?.description
      ? sanitizeHtml(product.description, {
          allowedTags: [
            'p',
            'br',
            'b',
            'strong',
            'i',
            'em',
            'u',
            'ul',
            'ol',
            'li',
            'div',
            'span',
          ],
          allowedAttributes: { '*': ['style'] },
        })
      : '';

    const firstVariantId = product?.variantProperties?.[0]?.id ?? null;

    const productData = product
      ? {
          id: product.id,
          title: product.title,
          description: safeDescription,
          price: product.priceWithTax
            ? `₹${(product.priceWithTax / 100).toLocaleString('en-IN')}`
            : '',
          priceWithTax: product.priceWithTax,
          featuredAsset: product.featuredAsset ?? null,
          faculties: product.faculties ?? [],
          variantId: firstVariantId,
        }
      : null;

    return json({ slug: normalizedSlug, product: productData, specifications });
  } catch (error) {
    console.error('Error loading course detail:', error);
    return json({ slug: normalizedSlug, product: null, specifications: null });
  }
}

export default function OurCoursesCourseDetailRoute() {
  const { slug, product, specifications } = useLoaderData<typeof loader>();
  return (
    <CourseDetailPage
      slug={slug}
      product={product}
      specifications={specifications}
    />
  );
}
