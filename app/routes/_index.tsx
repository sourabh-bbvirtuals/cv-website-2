// app/routes/_index.tsx
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => [
  {
    title:
      'Commerce Virtuals | CBSE, Maharashtra HSC & CUET Courses for Class 11 & 12',
  },
  {
    name: 'description',
    content:
      "India's only commerce-exclusive EdTech platform. Structured courses, test series & mentorship for CBSE, Maharashtra Board HSC and CUET-UG. Built for Class 11 & 12 commerce students.",
  },
];
import Layout from '~/components/Layout';
import FAQSection from '~/components/new-homepage/FAQSection';
import Faq from '~/components/new-homepage/Faq';
import FeaturedCourses from '~/components/new-homepage/FeaturedCourses';
import FreeResources from '~/components/new-homepage/FreeResources';
import Hero from '~/components/new-homepage/Hero';
import LearningFormats from '~/components/new-homepage/LearningFormats';
import OurTeam from '~/components/new-homepage/OurTeam';
import TeamSection from '~/components/new-homepage/TeamSection';
import Testimonials from '~/components/new-homepage/Testimonials';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import {
  BoardSelectionProvider,
  parseBoardCookie,
  type BoardOption,
} from '~/context/BoardSelectionContext';

import { API_URL } from '~/constants';
import HowItWorks from '~/components/new-homepage/HowItWorks';
import FacultySection from '~/components/new-homepage/FacultySection';

function gqlFetch(query: string) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then((r) => r.json());
}

const PARENT_QUERY = `
  query homePageParent {
    collection(slug: "home-page") {
      id
      children {
        id
        name
        slug
        customFields { customData }
      }
    }
  }
`;

function childQuery(slug: string) {
  return `
    query homePageChild {
      collection(slug: "${slug}") {
        id
        name
        customFields { customData }
        productVariants {
          items {
            id
            name
            featuredAsset { preview }
            facetValues { name facet { name } }
            priceWithTax
            product {
              id
              name
              slug
              customFields { customData offers }
              featuredAsset { preview }
              facetValues { name facet { name } }
            }
          }
        }
      }
    }
  `;
}

const SECTIONS_QUERY = `
  query homepageSections {
    teamCollection: collection(slug: "cv-team") {
      id
      customFields { customData }
    }
    testimonialsCollection: collection(slug: "cv-testimonials") {
      id
      customFields { customData }
    }
    faqsCollection: collection(slug: "cv-faqs") {
      id
      customFields { customData }
    }
  }
`;

const ALL_PRODUCTS_QUERY = `
  query allProducts {
    products(options: { take: 20, sort: { createdAt: DESC } }) {
      items {
        id
        name
        slug
        featuredAsset { preview }
        customFields { customData offers }
        facetValues { name facet { name } }
        variants {
          id
          name
          priceWithTax
          featuredAsset { preview }
          facetValues { name facet { name } }
        }
      }
    }
  }
`;

function mapProductsToCourses(products: any[]) {
  return (products || []).map((product: any) => {
    const variants = product.variants || [];
    const variant = variants[0] || {};
    const productFacets = product.facetValues || [];
    const variantFacets = variant.facetValues || [];
    const facetNames = [...productFacets, ...variantFacets]
      .map((fv: any) => fv.name)
      .filter(Boolean);

    const byGroup = (group: string) => {
      const fromProduct = productFacets
        .filter(
          (fv: any) => fv?.facet?.name?.toLowerCase() === group.toLowerCase(),
        )
        .map((fv: any) => fv.name);
      if (fromProduct.length > 0) return fromProduct;
      return variantFacets
        .filter(
          (fv: any) => fv?.facet?.name?.toLowerCase() === group.toLowerCase(),
        )
        .map((fv: any) => fv.name);
    };

    let table: any = {};
    try {
      const customDataRaw = product.customFields?.customData;
      if (customDataRaw) {
        const parsed =
          typeof customDataRaw === 'string'
            ? JSON.parse(customDataRaw)
            : customDataRaw;
        const specsObj = parsed.specifications || {};
        const specs = Array.isArray(specsObj.product) ? specsObj.product : [];
        const courseInfo =
          specs.find(
            (s: any) =>
              s && (s.identifier === 'course_info' || s.name === 'Course Info'),
          ) || {};
        table = courseInfo?.table || {};
      }
    } catch {
      /* ignore */
    }

    const minPrice = variants.reduce(
      (min: number, v: any) =>
        v?.priceWithTax != null && v.priceWithTax < min ? v.priceWithTax : min,
      variants[0]?.priceWithTax ?? 0,
    );
    const priceVal = minPrice / 100;

    const language = byGroup('language')[0] || '';
    const lectureMode = byGroup('lecture mode')[0] || '';

    // Extract wasPrice from offers array & apply discount to display price
    // Logic: basePrice - discount1 - discount2 - ... = discountedPrice
    // Example: 8000 - (8000*25/100) - 1000 = 6200
    let wasPrice = '';
    let displayPrice = priceVal; // Default to base price if no discounts

    try {
      const offersRaw = product.customFields?.offers;
      if (offersRaw) {
        const offers =
          typeof offersRaw === 'string' ? JSON.parse(offersRaw) : offersRaw;
        if (Array.isArray(offers) && offers.length > 0) {
          let totalDiscount = 0;
          offers.forEach((offer: any) => {
            if (offer.discountType === 'percentage' && offer.discountValue) {
              totalDiscount +=
                priceVal * (parseFloat(offer.discountValue) / 100);
            } else if (offer.discountType === 'fixed' && offer.discountValue) {
              totalDiscount += parseFloat(offer.discountValue);
            }
          });
          if (totalDiscount > 0) {
            displayPrice = Math.max(0, priceVal - totalDiscount);
            wasPrice = `₹${Math.round(priceVal).toLocaleString('en-IN')}`; // Show base price with strikethrough
          }
        }
      }
    } catch (e) {
      // silently ignore offer parsing errors
    }

    return {
      id: variant.id || product.id,
      title: product.name,
      slug: product.slug || '',
      meta: facetNames,
      enrolled: '1240+ Students Enrolled',
      image:
        product.featuredAsset?.preview || variant.featuredAsset?.preview || '',
      badge: table['Badge'] || null,
      starts: table['Start Date'] || 'TBA',
      ends: table['End Date'] || 'TBA',
      price: `₹${Math.round(displayPrice).toLocaleString('en-IN')}`,
      wasPrice,
      language,
      lectureMode,
    };
  });
}

/** Match `our-courses._index` — Olympiad is only promoted via /olympiad and nav, not in course grids. */
function filterOutOlympiadProducts<T extends { title?: string; slug?: string }>(
  courses: T[],
): T[] {
  return courses.filter((c) => {
    const name = (c.title || '').toLowerCase();
    const slug = (c.slug || '').toLowerCase();
    return !name.includes('olympiad') && !slug.includes('olympiad');
  });
}

function parseCollectionData(raw: string | null | undefined): any {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

function parseChildCustomData(
  raw: string | null | undefined,
): Omit<BoardOption, 'slug'> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.class && parsed.board) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function mapVariantsToCourses(items: any[]) {
  return (items || []).map((variant: any) => {
    const product = variant.product || {};
    const productFacets = product.facetValues || [];
    const variantFacets = variant.facetValues || [];
    const facetNames = [...productFacets, ...variantFacets]
      .map((fv: any) => fv.name)
      .filter(Boolean);

    const byGroup = (group: string) => {
      const fromProduct = productFacets
        .filter(
          (fv: any) => fv?.facet?.name?.toLowerCase() === group.toLowerCase(),
        )
        .map((fv: any) => fv.name);
      if (fromProduct.length > 0) return fromProduct;
      return variantFacets
        .filter(
          (fv: any) => fv?.facet?.name?.toLowerCase() === group.toLowerCase(),
        )
        .map((fv: any) => fv.name);
    };

    let table: any = {};
    try {
      const customDataRaw = product.customFields?.customData;
      if (customDataRaw) {
        const parsed =
          typeof customDataRaw === 'string'
            ? JSON.parse(customDataRaw)
            : customDataRaw;
        const specsObj = parsed.specifications || {};
        const specs = Array.isArray(specsObj.product) ? specsObj.product : [];
        const courseInfo =
          specs.find(
            (s: any) =>
              s && (s.identifier === 'course_info' || s.name === 'Course Info'),
          ) || {};
        table = courseInfo?.table || {};
      }
    } catch {
      /* ignore */
    }

    const priceVal = variant.priceWithTax ? variant.priceWithTax / 100 : 0;

    const language = byGroup('language')[0] || '';
    const lectureMode = byGroup('lecture mode')[0] || '';

    // Extract wasPrice from offers array & apply discount to display price
    // Logic: basePrice - discount1 - discount2 - ... = discountedPrice
    // Example: 8000 - (8000*25/100) - 1000 = 6200
    let wasPrice = '';
    let displayPrice = priceVal; // Default to base price if no discounts

    try {
      const offersRaw = product.customFields?.offers;
      if (offersRaw) {
        const offers =
          typeof offersRaw === 'string' ? JSON.parse(offersRaw) : offersRaw;
        if (Array.isArray(offers) && offers.length > 0) {
          let totalDiscount = 0;
          offers.forEach((offer: any) => {
            if (offer.discountType === 'percentage' && offer.discountValue) {
              totalDiscount +=
                priceVal * (parseFloat(offer.discountValue) / 100);
            } else if (offer.discountType === 'fixed' && offer.discountValue) {
              totalDiscount += parseFloat(offer.discountValue);
            }
          });
          if (totalDiscount > 0) {
            displayPrice = Math.max(0, priceVal - totalDiscount);
            wasPrice = `₹${Math.round(priceVal).toLocaleString('en-IN')}`; // Show base price with strikethrough
          }
        }
      }
    } catch (e) {
      // silently ignore offer parsing errors
    }

    return {
      id: variant.id,
      title: variant.name,
      slug: product.slug || '',
      meta: facetNames,
      enrolled: '1240+ Students Enrolled',
      image:
        product.featuredAsset?.preview || variant.featuredAsset?.preview || '',
      badge: table['Badge'] || null,
      starts: table['Start Date'] || 'TBA',
      ends: table['End Date'] || 'TBA',
      price: `₹${Math.round(displayPrice).toLocaleString('en-IN')}`,
      wasPrice,
      language,
      lectureMode,
    };
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieSlug = parseBoardCookie(request.headers.get('Cookie'));

    const [customerData, parentResult, sectionsResult] = await Promise.all([
      getActiveCustomerDetails({ request }).catch(() => null),
      gqlFetch(PARENT_QUERY)
        .then((r: any) => r.data?.collection)
        .catch(() => null),
      gqlFetch(SECTIONS_QUERY)
        .then((r: any) => r.data)
        .catch(() => null),
    ]);

    const teamData = parseCollectionData(
      sectionsResult?.teamCollection?.customFields?.customData,
    );
    const testimonialsData = parseCollectionData(
      sectionsResult?.testimonialsCollection?.customFields?.customData,
    );
    const faqsData = parseCollectionData(
      sectionsResult?.faqsCollection?.customFields?.customData,
    );

    const children: any[] = parentResult?.children || [];
    const boardOptions: BoardOption[] = children
      .map((c: any) => {
        const meta = parseChildCustomData(c.customFields?.customData);
        if (!meta) return null;
        return { slug: c.slug, ...meta };
      })
      .filter(Boolean) as BoardOption[];

    const isLoggedIn = !!customerData?.activeCustomer;

    let selectedSlug =
      cookieSlug && boardOptions.some((o) => o.slug === cookieSlug)
        ? cookieSlug
        : '';

    let hasExplicitBoard = !!selectedSlug;

    if (!selectedSlug && boardOptions.length > 0) {
      const cookies = request.headers.get('Cookie') || '';
      const boardMatch = cookies.match(/bb-user-board=([^;]*)/);
      const classMatch = cookies.match(/bb-user-class=([^;]*)/);
      if (boardMatch) {
        const userBoard = decodeURIComponent(boardMatch[1]).toLowerCase();
        const userClass = classMatch
          ? decodeURIComponent(classMatch[1]).replace(/\D/g, '')
          : '';
        const matched =
          boardOptions.find((o) => {
            const oBoard = o.board.toLowerCase();
            const oClass = o.class.replace(/\D/g, '');
            return (
              oBoard.includes(userBoard) &&
              userClass &&
              oClass.includes(userClass)
            );
          }) ||
          boardOptions.find((o) => o.board.toLowerCase().includes(userBoard));
        if (matched) {
          selectedSlug = matched.slug;
          hasExplicitBoard = true;
        }
      }
    }

    if (!selectedSlug && boardOptions.length > 0 && isLoggedIn) {
      const c = customerData?.activeCustomer;
      const userBoard = ((c as any)?.customFields?.board || '').toLowerCase();
      const userClass = ((c as any)?.customFields?.studentClass || '')
        .toString()
        .replace(/\D/g, '');
      if (userBoard) {
        const matched =
          boardOptions.find((o) => {
            const oBoard = o.board.toLowerCase();
            const oClass = o.class.replace(/\D/g, '');
            return (
              oBoard.includes(userBoard) &&
              userClass &&
              oClass.includes(userClass)
            );
          }) ||
          boardOptions.find((o) => o.board.toLowerCase().includes(userBoard));
        if (matched) {
          selectedSlug = matched.slug;
          hasExplicitBoard = true;
        }
      }
    }

    if (!selectedSlug && boardOptions.length > 0) {
      selectedSlug = boardOptions[0]?.slug || '';
    }

    let featuredCourses: any[] = [];

    if (selectedSlug) {
      const childResult = await gqlFetch(childQuery(selectedSlug))
        .then((r: any) => r.data?.collection)
        .catch(() => null);

      if (childResult) {
        featuredCourses = mapVariantsToCourses(
          childResult.productVariants?.items,
        );
      }
    }

    if (featuredCourses.length === 0) {
      const allProducts = await gqlFetch(ALL_PRODUCTS_QUERY)
        .then((r: any) => r.data?.products?.items || [])
        .catch(() => []);
      featuredCourses = mapProductsToCourses(allProducts);
    }

    featuredCourses = filterOutOlympiadProducts(featuredCourses);

    return json({
      isLoggedIn,
      featuredCourses,
      boardOptions,
      selectedSlug,
      hasExplicitBoard,
      teamSection: teamData,
      testimonialSection: testimonialsData,
      faqSection: faqsData,
    });
  } catch (error: any) {
    console.error('Error in homepage loader:', error.message || error);
    return json({
      isLoggedIn: false,
      featuredCourses: [],
      boardOptions: [],
      selectedSlug: '',
      hasExplicitBoard: false,
      teamSection: null,
      testimonialSection: null,
      faqSection: null,
    });
  }
}

export default function Index() {
  const {
    isLoggedIn,
    featuredCourses,
    boardOptions,
    selectedSlug,
    hasExplicitBoard,
    teamSection,
    testimonialSection,
    faqSection,
  } = useLoaderData<typeof loader>();

  return (
    <BoardSelectionProvider
      selectedSlug={selectedSlug}
      boardOptions={boardOptions}
    >
      <Layout>
        <div className="flex flex-col">
          <Hero isLoggedIn={isLoggedIn} />

          <div className="my-10  lg:my-20" />

          {/* <FacultySection /> */}

          {teamSection ? (
            <TeamSection
              title={teamSection.title || 'They are best at what they do'}
              members={teamSection.members || []}
              boardFaculties={{
                mh: teamSection.mh || [],
                cbse: teamSection.cbse || [],
                cuet: teamSection.cuet || [],
              }}
              hasExplicitBoard={hasExplicitBoard}
            />
          ) : (
            <OurTeam />
          )}

          <div className="my-10  lg:my-20" />

          <LearningFormats />

          <div className="my-10  lg:my-20" />

          <HowItWorks />

          <div className="my-10  lg:my-20" />

          <FeaturedCourses courses={featuredCourses} />

          <div className="my-10  lg:my-20" />

          <FreeResources />

          <div className="my-10  lg:my-20" />

          <Testimonials
            title={testimonialSection?.title}
            testimonials={testimonialSection?.testimonials}
          />

          <div className="my-10  lg:my-20" />

          {faqSection?.faqs?.length > 0 ? (
            <FAQSection title={faqSection.title} faqs={faqSection.faqs} />
          ) : (
            <Faq />
          )}
          <div className="my-10  lg:my-20" />
        </div>
      </Layout>
    </BoardSelectionProvider>
  );
}
