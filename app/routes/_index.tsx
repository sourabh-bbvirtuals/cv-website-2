// app/routes/_index.tsx
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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
        customFields { homePageData }
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

    const [customerData, parentResult] = await Promise.all([
      getActiveCustomer({ request }).catch(() => null),
      gqlFetch(PARENT_QUERY)
        .then((r: any) => r.data?.collection)
        .catch(() => null),
    ]);

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

    let homeData = null;
    let featuredCourses: any[] = [];

    if (selectedSlug) {
      const childResult = await gqlFetch(childQuery(selectedSlug))
        .then((r: any) => r.data?.collection)
        .catch(() => null);

      if (childResult) {
        const rawData = childResult.customFields?.homePageData;
        if (rawData) {
          try {
            homeData = JSON.parse(rawData);
          } catch {
            /* ignore */
          }
        }
        featuredCourses = mapVariantsToCourses(
          childResult.productVariants?.items,
        );
      }
    }

    return json({
      isLoggedIn: !!customerData?.activeCustomer,
      homePageData: homeData,
      featuredCourses,
      boardOptions,
      selectedSlug,
    });
  } catch (error: any) {
    console.error('Error in homepage loader:', error.message || error);
    return json({
      isLoggedIn: false,
      homePageData: null,
      featuredCourses: [],
      boardOptions: [],
      selectedSlug: '',
    });
  }
}

export default function Index() {
  const {
    isLoggedIn,
    homePageData,
    featuredCourses,
    boardOptions,
    selectedSlug,
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

          {homePageData?.teamSection?.members?.length > 0 ? (
            <TeamSection
              title={homePageData.teamSection.title}
              members={homePageData.teamSection.members}
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
            title={homePageData?.testimonialSection?.title}
            testimonials={homePageData?.testimonialSection?.testimonials}
          />

          <div className="my-16 md:my-24 lg:my-20" />

          {homePageData?.faqSection?.faqs?.length > 0 ? (
            <FAQSection
              title={homePageData.faqSection.title}
              faqs={homePageData.faqSection.faqs}
            />
          ) : (
            <Faq />
          )}
          <div className="my-16 md:my-24 lg:my-20" />
        </div>
      </Layout>
    </BoardSelectionProvider>
  );
}
