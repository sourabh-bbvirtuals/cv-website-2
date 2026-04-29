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
    // Fetch product + collection + team data in parallel
    const teamFetch = fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ collection(slug: "cv-team") { customFields { customData } } }`,
      }),
    })
      .then((r) => r.json())
      .catch(() => null);

    const [productResult, collectionResult, teamResult] =
      await Promise.allSettled([
        getProductBySlug(normalizedSlug, { request }),
        getCollectionBySlug(normalizedSlug, { request }),
        teamFetch,
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

    const variants = product?.variantProperties ?? [];
    const allOptionGroups = product?.optionProperties ?? [];
    const firstVariantId = variants[0]?.id ?? null;

    // Collect only the option group IDs that variants actually reference
    const usedGroupIds = new Set<string>();
    for (const v of variants) {
      for (const o of v.options || []) {
        if (o.group?.id) usedGroupIds.add(o.group.id);
      }
    }

    // Filter to only groups used by variants, deduplicate by ID
    const optionGroups = allOptionGroups.filter((og) =>
      usedGroupIds.has(og.id),
    );
    const hasOptions = optionGroups.length > 0 && variants.length > 1;

    // Enrich faculty images from specifications when collection-based images are missing
    let faculties = product?.faculties ?? [];
    if (specifications?.product) {
      const facultySpec = specifications.product.find(
        (s: any) =>
          s.identifier === 'our_faculty' ||
          s.identifier === 'faculty_info' ||
          s.identifier === 'faculties',
      );
      const facultyInfos: Array<{
        name?: string;
        imageUrl?: string;
        description?: string;
      }> = facultySpec?.facultyInfos ?? [];
      if (facultyInfos.length > 0) {
        if (faculties.length === 0) {
          faculties = facultyInfos.map((f: any) => ({
            name: f.name || 'Faculty',
            image: f.imageUrl || '',
            description: f.description || '',
          }));
        } else {
          faculties = faculties.map((fd: any) => {
            const fdName = fd.name?.toLowerCase() || '';
            const match = facultyInfos.find((f: any) => {
              const fName = f.name?.toLowerCase() || '';
              return (
                fName &&
                (fName === fdName ||
                  fName.includes(fdName) ||
                  fdName.includes(fName))
              );
            });
            if (match) {
              return {
                ...fd,
                image: fd.image || match.imageUrl || '',
                description: fd.description || match.description || '',
              };
            }
            return fd;
          });
        }
      }
    }

    // Enrich faculty with designation/experience from cv-team collection
    try {
      const teamRaw =
        teamResult.status === 'fulfilled'
          ? teamResult.value?.data?.collection?.customFields?.customData
          : null;
      if (teamRaw) {
        const teamParsed =
          typeof teamRaw === 'string' ? JSON.parse(teamRaw) : teamRaw;
        const allTeamMembers = [
          ...(teamParsed.mh || []),
          ...(teamParsed.cbse || []),
          ...(teamParsed.cuet || []),
        ];
        if (allTeamMembers.length > 0) {
          faculties = faculties.map((fd: any) => {
            const fdName = fd.name?.toLowerCase() || '';
            const match = allTeamMembers.find((t: any) => {
              const tName = t.name?.toLowerCase() || '';
              return (
                tName &&
                (tName === fdName ||
                  tName.includes(fdName) ||
                  fdName.includes(tName))
              );
            });
            if (match) {
              return {
                ...fd,
                designation: fd.designation || match.designation || '',
                experience: fd.experience || match.experience || '',
              };
            }
            return fd;
          });
        }
      }
    } catch {
      // non-fatal
    }

    // Prefer the short_description spec over the Vendure description field
    const specList = specifications?.product || [];
    const shortDescSpec = specList.find(
      (s: any) => s.identifier === 'short_description',
    );
    const finalDescription = shortDescSpec?.text
      ? sanitizeHtml(shortDescSpec.text, {
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
      : safeDescription;

    const productData = product
      ? {
          id: product.id,
          title: product.title,
          description: finalDescription,
          price: product.priceWithTax
            ? `₹${(product.priceWithTax / 100).toLocaleString('en-IN')}`
            : '',
          priceWithTax: product.priceWithTax,
          featuredAsset: product.featuredAsset ?? null,
          faculties,
          facetValues: product.facetValues ?? [],
          variantId: firstVariantId,
          ...(hasOptions && {
            optionGroups: optionGroups.map((og) => ({
              id: og.id,
              name: og.name,
              code: og.code,
              options: og.options.map((o: any) => ({ id: o.id, name: o.name })),
            })),
            variants: variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceWithTax: v.priceWithTax,
              currencyCode: v.currencyCode,
              sku: v.sku,
              stockLevel: v.stockLevel,
              options: (v.options || []).map((o: any) => ({
                id: o.id,
                name: o.name,
                group: o.group
                  ? { id: o.group.id, name: o.group.name }
                  : undefined,
              })),
            })),
          }),
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
  console.log('🚀 Loaded course detail data:', {
    slug,
    product,
    specifications,
  });
  return (
    <CourseDetailPage
      slug={slug}
      product={product}
      specifications={specifications}
    />
  );
}
