import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import CourseListings from '~/components/our-courses/CourseListings';
import Hero from '~/components/our-courses/Hero';
import { API_URL } from '~/constants';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(API_URL, {
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
                }
                featuredAsset {
                  preview
                }
                facetValues {
                  name
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
    });

    const result = (await response.json()) as {
      data?: { products?: { items: any[] } };
    };
    const products = result?.data?.products?.items || [];

    return json({ products, error: null });
  } catch (error: any) {
    console.error('❌ Error in our-courses loader:', error.message || error);
    return json({
      products: [],
      error: error.message || 'Failed to fetch course data',
    });
  }
}

/** Listings only — layout + outlet live in `our-courses.tsx` */
export default function OurCoursesIndexRoute() {
  const { products, error } = useLoaderData<typeof loader>();

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
    </>
  );
}
