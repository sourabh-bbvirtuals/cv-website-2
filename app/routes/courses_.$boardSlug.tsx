import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, type MetaFunction } from '@remix-run/react';
import Layout from '~/components/Layout';
import CourseListings from '~/components/our-courses/CourseListings';
import { API_URL } from '~/constants';
import {
  BoardSelectionProvider,
  parseBoardCookie,
  type BoardOption,
} from '~/context/BoardSelectionContext';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.boardLabel ? `${data.boardLabel} Courses` : 'Courses';
  return [{ title }];
};

function gqlFetch(query: string, variables?: Record<string, any>) {
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }).then((r) => r.json());
}

const PRODUCTS_BY_COLLECTION_QUERY = `
  query productsByCollection($slug: String!, $take: Int) {
    collection(slug: $slug) {
      id
      name
      productVariants(options: { take: $take }) {
        items {
          product {
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
    }
  }
`;

const PARENT_QUERY = `{
  collection(slug: "home-page") {
    children {
      slug
      customFields { customData }
    }
  }
}`;

export async function loader({ request, params }: LoaderFunctionArgs) {
  const boardSlug = params.boardSlug;
  if (!boardSlug) throw new Response('Not Found', { status: 404 });

  try {
    const [productsResult, parentResult] = await Promise.all([
      gqlFetch(PRODUCTS_BY_COLLECTION_QUERY, { slug: boardSlug, take: 100 }),
      gqlFetch(PARENT_QUERY),
    ]);

    const variantItems =
      productsResult?.data?.collection?.productVariants?.items || [];

    const seen = new Set<string>();
    const products: any[] = [];
    for (const vi of variantItems) {
      const p = vi.product;
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        products.push(p);
      }
    }

    const children: any[] = parentResult?.data?.collection?.children || [];
    const boardOptions: BoardOption[] = children
      .map((c: any) => {
        if (!c.customFields?.customData) return null;
        try {
          const meta = JSON.parse(c.customFields.customData);
          if (meta.class && meta.board)
            return { slug: c.slug, ...meta } as BoardOption;
        } catch {
          /* ignore */
        }
        return null;
      })
      .filter(Boolean) as BoardOption[];

    const currentBoard = boardOptions.find((o) => o.slug === boardSlug);
    const cookieSlug = parseBoardCookie(request.headers.get('Cookie'));
    const selectedSlug =
      cookieSlug && boardOptions.some((o) => o.slug === cookieSlug)
        ? cookieSlug
        : boardSlug;

    return json({
      products,
      boardSlug,
      boardLabel: currentBoard?.label || boardSlug,
      boardOptions,
      selectedSlug,
      error: null,
    });
  } catch (error: any) {
    console.error('Error in board courses loader:', error.message || error);
    return json({
      products: [],
      boardSlug,
      boardLabel: boardSlug,
      boardOptions: [] as BoardOption[],
      selectedSlug: boardSlug,
      error: error.message || 'Failed to fetch courses',
    });
  }
}

export default function BoardCoursesRoute() {
  const { products, boardSlug, boardLabel, boardOptions, selectedSlug, error } =
    useLoaderData<typeof loader>();

  return (
    <BoardSelectionProvider
      selectedSlug={selectedSlug}
      boardOptions={boardOptions}
    >
      <Layout>
        <div className="pt-24 lg:pt-32 min-h-screen">
          {/* Hero */}
          <section className="min-h-100 4xl:min-h-150! pb-6 md:pb-10 4xl:pb-15! flex items-end bg-[#FFF8F9] border-b border-[#0816271A]">
            <div className="custom-container">
              {/* Board tabs */}
              {boardOptions.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {boardOptions.map((opt) => (
                    <a
                      key={opt.slug}
                      href={`/courses/${opt.slug}`}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                        opt.slug === boardSlug
                          ? 'bg-lightgray text-white border-lightgray'
                          : 'bg-white text-lightgray border-lightgray/10 hover:border-lightgray/30'
                      }`}
                    >
                      {opt.label || `${opt.class} ${opt.board}`}
                    </a>
                  ))}
                </div>
              )}
              <h2 className="section-heading mb-3 sm:mb-4 font-semibold">
                {boardLabel} Courses
              </h2>
              <p className="text-lightgray font-normal text-lg lg:text-xl leading-[150%]">
                Explore all courses for {boardLabel}. Expert-led coaching with
                exam-focused learning, free study materials and mock tests.
              </p>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 border-b border-red-100 text-center">
              <p className="font-medium">Warning: {error}</p>
              <p className="text-sm">
                Please check your Vendure connection or logs.
              </p>
            </div>
          )}

          <CourseListings products={products} />
        </div>
      </Layout>
    </BoardSelectionProvider>
  );
}
