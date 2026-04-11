import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import Layout from '~/components/Layout';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  BoardSelectionProvider,
  parseBoardCookie,
  type BoardOption,
} from '~/context/BoardSelectionContext';
import { API_URL } from '~/constants';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieSlug = parseBoardCookie(request.headers.get('Cookie'));
  try {
    const parentResult = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query homePageParent {
          collection(slug: "home-page") {
            id
            children { id name slug customFields { customData } }
          }
        }`,
      }),
    })
      .then((r) => r.json())
      .then((r: any) => r.data?.collection)
      .catch(() => null);

    const children: any[] = parentResult?.children || [];
    const boardOptions: BoardOption[] = children
      .map((c: any) => {
        if (!c.customFields?.customData) return null;
        try {
          const parsed = JSON.parse(c.customFields.customData);
          if (parsed.class && parsed.board)
            return { slug: c.slug, ...parsed } as BoardOption;
        } catch {}
        return null;
      })
      .filter(Boolean) as BoardOption[];

    const selectedSlug =
      cookieSlug && boardOptions.some((o) => o.slug === cookieSlug)
        ? cookieSlug
        : boardOptions[0]?.slug || '';

    return json({ boardOptions, selectedSlug });
  } catch {
    return json({ boardOptions: [] as BoardOption[], selectedSlug: '' });
  }
}

/**
 * Parent for `/our-courses` and `/our-courses/:slug`.
 * Child routes render in `<Outlet />` — without this, slug URLs still showed listings.
 */
export default function OurCoursesLayoutRoute() {
  const location = useLocation();
  const { boardOptions, selectedSlug } = useLoaderData<typeof loader>();

  const isOurCoursesDetailPage = location.pathname.startsWith('/our-courses/');

  return (
    <BoardSelectionProvider
      selectedSlug={selectedSlug}
      boardOptions={boardOptions}
    >
      <Layout>
        <div
          className={`${
            isOurCoursesDetailPage ? 'pt-0 md:pt-24' : 'pt-24 lg:pt-32'
          } min-h-screen`}
        >
          <Outlet />
        </div>
      </Layout>
    </BoardSelectionProvider>
  );
}
