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
import { getActiveCustomer } from '~/providers/customer/customer';
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
            facetValues { name }
            priceWithTax
            product {
              id
              name
              slug
              customFields { customData }
              featuredAsset { preview }
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
        customFields { customData }
        variants {
          id
          name
          priceWithTax
          featuredAsset { preview }
          facetValues { name }
        }
      }
    }
  }
`;

function mapProductsToCourses(products: any[]) {
  return (products || []).map((product: any) => {
    const variant = product.variants?.[0] || {};
    const facetNames = variant.facetValues?.map((fv: any) => fv.name) || [];

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
    const wasPriceVal = priceVal * 1.5;

    const language =
      facetNames.find((f: string) =>
        ['English', 'Hindi', 'Hinglish'].includes(f),
      ) || 'Hinglish';
    const type = facetNames.includes('Recorded') ? 'Recorded' : 'Live';

    return {
      id: variant.id || product.id,
      title: product.name,
      slug: product.slug || '',
      meta: facetNames,
      enrolled: '1240+ Students Enrolled',
      image:
        variant.featuredAsset?.preview || product.featuredAsset?.preview || '',
      badge: table['Badge'] || null,
      starts: table['Start Date'] || 'TBA',
      ends: table['End Date'] || 'TBA',
      price: `₹${Math.round(priceVal).toLocaleString('en-IN')}`,
      wasPrice: `₹${Math.round(wasPriceVal).toLocaleString('en-IN')}`,
      language,
      type,
    };
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
    const facetNames = variant.facetValues?.map((fv: any) => fv.name) || [];

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
    const wasPriceVal = priceVal * 1.5;

    const language =
      facetNames.find((f: string) =>
        ['English', 'Hindi', 'Hinglish'].includes(f),
      ) || 'Hindi';
    const type = facetNames.includes('Recorded') ? 'Recorded' : 'Live';

    return {
      id: variant.id,
      title: variant.name,
      slug: product.slug || '',
      meta: facetNames,
      enrolled: '1240+ Students Enrolled',
      image:
        variant.featuredAsset?.preview || product.featuredAsset?.preview || '',
      badge: table['Badge'] || null,
      starts: table['Start Date'] || 'TBA',
      ends: table['End Date'] || 'TBA',
      price: `₹${Math.round(priceVal).toLocaleString('en-IN')}`,
      wasPrice: `₹${Math.round(wasPriceVal).toLocaleString('en-IN')}`,
      language,
      type,
    };
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieSlug = parseBoardCookie(request.headers.get('Cookie'));

    const [customerData, parentResult, sectionsResult] = await Promise.all([
      getActiveCustomer({ request }).catch(() => null),
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

    const selectedSlug =
      cookieSlug && boardOptions.some((o) => o.slug === cookieSlug)
        ? cookieSlug
        : boardOptions[0]?.slug || '';

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

    return json({
      isLoggedIn: !!customerData?.activeCustomer,
      featuredCourses,
      boardOptions,
      selectedSlug,
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

          <div className="my-16 md:my-24 lg:my-20" />

          {/* <FacultySection /> */}

          {teamSection?.members?.length > 0 ? (
            <TeamSection
              title={teamSection.title}
              members={teamSection.members}
            />
          ) : (
            <OurTeam />
          )}

          <div className="my-16 md:my-24 lg:my-20" />

          <LearningFormats />

          <div className="my-16 md:my-24 lg:my-20" />

          <HowItWorks />

          <div className="my-16 md:my-24 lg:my-20" />

          <FeaturedCourses courses={featuredCourses} />

          <div className="my-16 md:my-24 lg:my-20" />

          <FreeResources />

          <div className="my-16 md:my-24 lg:my-20" />

          <Testimonials
            title={testimonialSection?.title}
            testimonials={testimonialSection?.testimonials}
          />

          <div className="my-16 md:my-24 lg:my-20" />

          {faqSection?.faqs?.length > 0 ? (
            <FAQSection title={faqSection.title} faqs={faqSection.faqs} />
          ) : (
            <Faq />
          )}
          <div className="my-16 md:my-24 lg:my-20" />
        </div>
      </Layout>
    </BoardSelectionProvider>
  );
}
