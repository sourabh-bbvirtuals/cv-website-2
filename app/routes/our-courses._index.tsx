import { json, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => [
  {
    title:
      'Commerce Courses for Class 11 & 12 – CBSE, HSC & CUET | Commerce Virtuals',
  },
  {
    name: 'description',
    content:
      "Join India's only commerce-exclusive platform covering CBSE, Maharashtra HSC and CUET-UG. Structured courses, organised test series & live mentorship for Class 11 & 12 students.",
  },
];
import CourseListings from '~/components/our-courses/CourseListings';
import Hero from '~/components/our-courses/Hero';
import { API_URL } from '~/constants';
export async function loader() {
  try {
    const productsResult = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query products($options: ProductListOptions) {
            products(options: $options) {
              totalItems
              items {
                id
                name
                slug
                description
                customFields {
                  customData
                  offers
                }
                featuredAsset {
                  preview
                }
                facetValues {
                  name
                  facet {
                    name
                  }
                }
                variants {
                  id
                  priceWithTax
                }
              }
            }
          }
        `,
        variables: { options: { take: 100 } },
      }),
    }).then((r) => r.json());

    const allProducts = (productsResult as any)?.data?.products?.items || [];

    // Filter out Olympiad products - they should only appear on the dedicated Olympiad page
    const products = allProducts.filter((product: any) => {
      const name = product.name?.toLowerCase() || '';
      const slug = product.slug?.toLowerCase() || '';
      return !name.includes('olympiad') && !slug.includes('olympiad');
    });

    return json({ products, error: null });
  } catch (error: any) {
    console.error('❌ Error in our-courses loader:', error.message || error);
    return json({
      products: [],
      error: error.message || 'Failed to fetch course data',
    });
  }
}

const COURSE_CATEGORIES = [
  {
    heading: 'CBSE Class 11 & 12 Commerce Courses',
    subtext:
      'Complete CBSE coverage for Accountancy, Business Studies, and Economics — taught with the depth your board exams demand and the test series that builds real exam confidence.',
  },
  {
    heading: 'Maharashtra Board (HSC) Commerce Courses — Class 11 & 12',
    subtext:
      'The most underserved board in EdTech — finally gets a dedicated platform. Covering BK & Accountancy, OCM, Economics, and Secretarial Practice with chapter tests, full mock papers, and Maharashtra-specific exam strategies.',
  },
  {
    heading: 'CUET-UG Commerce Preparation — Domain + General Test',
    subtext:
      'Our CUET programme covers all domain subjects (Accountancy, BST, Economics, Entrepreneurship) plus English and General Test — with full-length mocks and mentorship to get you into your dream DU college.',
  },
  {
    heading: 'The Complete Commerce Programme — Boards + CUET + Mentorship',
    subtext:
      'Most platforms give you videos. We give you a system. Join for personalised mentorship, weekly doubt sessions, a structured test series calendar, and performance tracking — everything a serious commerce student needs in one place.',
  },
];

/** Listings only — layout + outlet live in `our-courses.tsx` */
export default function OurCoursesIndexRoute() {
  const { products, error } = useLoaderData<typeof loader>();
  // console.log('🚀 Fetched products:', products);
  return (
    <>
      <Hero />
      {error && (
        <div className="bg-red-50 text-red-700 p-4 border-b border-red-100 text-center">
          <p className="font-medium">⚠️ {error}</p>
          <p className="text-sm">
            Please check your Vendure connection or logs.
          </p>
        </div>
      )}
      <CourseListings products={products} />

      {/* SEO: course category descriptions */}
      <section className="bg-white py-10 lg:py-14">
        <div className="custom-container space-y-8 lg:space-y-10">
          {COURSE_CATEGORIES.map((cat) => (
            <div key={cat.heading}>
              <h2 className="text-xl font-semibold leading-[130%] tracking-tight text-[#081627] sm:text-2xl lg:text-[28px]">
                {cat.heading}
              </h2>
              <p className="mt-2 max-w-[960px] text-sm leading-[160%] text-[#081627]/70 sm:text-base lg:text-lg">
                {cat.subtext}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
