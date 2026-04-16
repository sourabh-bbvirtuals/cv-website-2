import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import Hero from '~/components/our-courses/Hero';
import CourseListings from '~/components/our-courses/CourseListings';
import { API_URL } from '~/constants';

function slugEncode(urlPath: string): string {
  return urlPath
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('--');
}

export async function loader({ params }: LoaderFunctionArgs) {
  const rawPath = params['*'];
  if (!rawPath) {
    throw new Response('Not Found', { status: 404 });
  }

  const collectionSlug = slugEncode(rawPath);

  const collectionRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetCollection($slug: String!) {
          collection(slug: $slug) {
            id
            name
            slug
            description
          }
        }
      `,
      variables: { slug: collectionSlug },
    }),
  });

  const collectionResult = (await collectionRes.json()) as {
    data?: { collection?: any };
  };

  const collection = collectionResult?.data?.collection;
  if (!collection) {
    throw new Response('Not Found', { status: 404 });
  }

  // 2. Fetch products in this collection
  const productsRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query SearchProducts($collectionSlug: String!) {
          search(input: {
            collectionSlug: $collectionSlug,
            groupByProduct: true,
            take: 100
          }) {
            items {
              productId
              productName
              slug
              description
              productAsset {
                preview
              }
              priceWithTax {
                ... on SinglePrice { value }
                ... on PriceRange { min max }
              }
              facetValueIds
            }
          }
        }
      `,
      variables: { collectionSlug },
    }),
  });

  const productsResult = (await productsRes.json()) as {
    data?: { search?: { items: any[] } };
  };

  const searchItems = productsResult?.data?.search?.items ?? [];

  // 3. If we have search results, also fetch full product data for richer rendering
  // (facetValues names, customData, variants with prices)
  let products: any[] = [];

  if (searchItems.length > 0) {
    const slugs = searchItems.map((item: any) => item.slug).filter(Boolean);

    const fullProductsRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query Products($options: ProductListOptions) {
            products(options: $options) {
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
        variables: {
          options: {
            filter: { slug: { in: slugs } },
            take: 100,
          },
        },
      }),
    });

    const fullResult = (await fullProductsRes.json()) as {
      data?: { products?: { items: any[] } };
    };

    products = fullResult?.data?.products?.items ?? [];
  }

  return json({
    title: collection.name ?? '',
    subtitle: collection.description ?? '',
    products,
    error: null,
  });
}

export default function DynamicPageRoute() {
  const { title, subtitle, products, error } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="pt-24 lg:pt-32 min-h-screen">
        <Hero title={title} subtitle={subtitle} />
        {error && (
          <div className="bg-red-50 text-red-700 p-4 border-b border-red-100 text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}
        <CourseListings products={products} />
      </div>
    </Layout>
  );
}
