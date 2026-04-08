import { Outlet, useLocation, type LinksFunction } from '@remix-run/react';
import Layout from '~/components/Layout';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css',
  },
];

/**
 * Parent for `/our-courses` and `/our-courses/:slug`.
 * Child routes render in `<Outlet />` — without this, slug URLs still showed listings.
 */
export default function OurCoursesLayoutRoute() {
  const location = useLocation();

  const isOurCoursesDetailPage = location.pathname.startsWith('/our-courses/');

  return (
    <Layout>
      <div
        className={`${
          isOurCoursesDetailPage ? 'pt-0 md:pt-24' : 'pt-24 lg:pt-32'
        } min-h-screen`}
      >
        <Outlet />
      </div>
    </Layout>
  );
}
