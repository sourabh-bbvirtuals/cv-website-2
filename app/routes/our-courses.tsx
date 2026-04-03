import { Outlet, type LinksFunction } from '@remix-run/react';
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
  return (
    <Layout>
      <div className="pt-24 lg:pt-32 min-h-screen">
        <Outlet />
      </div>
    </Layout>
  );
}
