import {
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
  useLocation,
  useRouteError,
} from '@remix-run/react';
import stylesheet from './tailwind.css';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import {
  DataFunctionArgs,
  json,
  LinksFunction,
} from '@remix-run/server-runtime';
import { useEffect } from 'react';
import { getActiveCustomer } from '~/providers/customer/customer';
import { useActiveOrder } from '~/utils/use-active-order';
import { useChangeLanguage } from 'remix-i18next/react';
import { useTranslation } from 'react-i18next';
import { getI18NextServer } from '~/i18next.server';
import { getTopAnnouncementsForLayout } from '~/providers/announcements';
import Footer from './components/footer/Footer';
import {
  getSiteSettingsData,
  SiteSettingsData,
} from './providers/site-settings';
import {
  getHeaderNavigationData,
  HeaderNavigationData,
} from './providers/header/header-navigation';
import { getFooterData } from './providers/footer/footer';
import { setApiUrl } from './constants';
import { setSessionSecret } from './sessions';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  },
];

const devMode =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// The root data does not change once loaded.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  currentUrl,
  formAction,
}) => {
  if (currentUrl.pathname === '/sign-in') {
    // just logged in
    return true;
  }
  if (currentUrl.pathname === '/login') {
    // just logged in via new login route
    return true;
  }

  if (currentUrl.pathname === '/account' && nextUrl.pathname === '/') {
    // just logged out
    return true;
  }

  if (currentUrl.pathname.startsWith('/account/') && nextUrl.pathname === '/') {
    // just logged out from account nested routes
    return true;
  }
  if (formAction === '/checkout/payment') {
    // submitted payment for order
    return true;
  }
  if (formAction === '/login') {
    // login form submitted
    return true;
  }
  if (formAction === '/account') {
    // account form submitted (logout, etc.)
    return true;
  }
  return false;
};

export type RootLoaderData = {
  activeCustomer: Awaited<ReturnType<typeof getActiveCustomer>>;
  announcements: Awaited<ReturnType<typeof getTopAnnouncementsForLayout>>;
  locale: string;
  footerData: Awaited<ReturnType<typeof getFooterData>>;
  headerNavigation: HeaderNavigationData | null;
  ENV: {
    VENDURE_API_URL: string;
  };
};

export async function loader({ request, context }: DataFunctionArgs) {
  const cfEnv = (context as any)?.cloudflare?.env;
  if (cfEnv?.VENDURE_API_URL) {
    setApiUrl(cfEnv.VENDURE_API_URL);
  }
  if (cfEnv?.SESSION_SECRET) {
    setSessionSecret(cfEnv.SESSION_SECRET);
  }
  const activeCustomer = await getActiveCustomer({ request });

  const locale = await getI18NextServer().then((i18next) =>
    i18next.getLocale(request),
  );

  const [announcementsResult, headerNavResult, footerResult] =
    await Promise.allSettled([
      getTopAnnouncementsForLayout({ request }),
      getHeaderNavigationData({ request }),
      getFooterData({ request }),
    ]);

  const announcements =
    announcementsResult.status === 'fulfilled' ? announcementsResult.value : [];
  const headerNavigationData =
    headerNavResult.status === 'fulfilled' ? headerNavResult.value : null;
  const footerData =
    footerResult.status === 'fulfilled' ? footerResult.value : null;

  const loaderData: RootLoaderData = {
    activeCustomer,
    announcements,
    locale,
    footerData,
    headerNavigation: headerNavigationData,
    ENV: {
      VENDURE_API_URL:
        (context as any)?.cloudflare?.env?.VENDURE_API_URL ||
        process.env.VENDURE_API_URL ||
        '',
    },
  };
  const headers = activeCustomer?._headers || new Headers();
  return json(loaderData, { headers });
}

export default function App() {
  const loaderData = useLoaderData<RootLoaderData>();
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/sign-up', '/sign-in'];
  const shouldHideFooter =
    hideFooterRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/free-resources/quizzes/');
  const { footerData, locale } = loaderData;
  const { i18n } = useTranslation();
  const {
    activeOrderFetcher,
    activeOrder,
    adjustOrderLine,
    removeItem,
    refresh,
  } = useActiveOrder();
  useChangeLanguage(locale);

  useEffect(() => {
    // When the loader has run, this implies we should refresh the contents
    // of the activeOrder as the user may have signed in or out.
    if (loaderData.ENV.VENDURE_API_URL) {
      setApiUrl(loaderData.ENV.VENDURE_API_URL);
    }
    refresh();
  }, [loaderData]);

  const faviconUrl = '/favicon.ico';
  const title = 'BB Virtuals';

  useEffect(() => {
    const favicon = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = '/favicon.ico';
      document.head.appendChild(newFavicon);
    }
  }, []);

  const isQuizPlayPage = location.pathname.startsWith(
    '/free-resources/quizzes/',
  );

  return (
    <html lang={locale} dir={i18n.dir()} id="app">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/favicon.ico" type="image/png"></link>
        <title>{title}</title>
      </head>
      <body
        className={`flex flex-col min-h-screen ${
          isQuizPlayPage ? 'bg-[#F5F7FF]' : ''
        }`}
      >
        <main className="flex-1">
          <Outlet
            context={{
              activeOrderFetcher,
              activeOrder,
              adjustOrderLine,
              removeItem,
              activeCustomer: loaderData?.activeCustomer?.activeCustomer,
            }}
          />
        </main>
        <ScrollRestoration />
        <Scripts />
        {!shouldHideFooter && (
          <Footer
            variant={
              location.pathname === '/free-resources'
                ? 'freeResources'
                : 'default'
            }
            address={footerData?.address}
            helpline={footerData?.helpline}
            policyLinks={footerData?.policyLinks}
            socialLinks={footerData?.socialLinks}
            subscribeYoutube={footerData?.subscribeYoutube}
            whatsappQuickConnect={footerData?.whatsappQuickConnect}
          />
        )}

        {devMode && <LiveReload />}
      </body>
    </html>
  );
}

type DefaultSparseErrorPageProps = {
  tagline: string;
  headline: string;
  description: string;
};

/**
 * You should replace this in your actual storefront to provide a better user experience.
 * You probably want to still show your footer and navigation. You will also need fallbacks
 * for your data dependant components in case your shop instance / CMS isnt responding.
 * See: https://remix.run/docs/en/main/route/error-boundary
 */
function DefaultSparseErrorPage({
  tagline,
  headline,
  description,
}: DefaultSparseErrorPageProps) {
  const faviconUrl =
    typeof process !== 'undefined'
      ? process.env.FAVICON_URL || '/favicon.ico'
      : '/favicon.ico';
  useEffect(() => {
    const favicon = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = faviconUrl;
      document.head.appendChild(newFavicon);
    }
  }, [faviconUrl]);

  return (
    <html lang="en" id="app">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>Error</title>
      </head>
      <body>
        <main className="flex flex-col items-center px-4 py-16 sm:py-32 text-center">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {tagline}
          </span>
          <h1 className="mt-2 font-bold text-gray-900 tracking-tight text-4xl sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-4 text-base text-gray-500 max-w-full break-words">
            {description}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="text-base font-medium text-primary-600 hover:text-primary-500 inline-flex gap-2"
            >
              Go back home
            </Link>
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
        {devMode && <LiveReload />}
      </body>
    </html>
  );
}

/**
 * As mentioned in the jsdoc for `DefaultSparseErrorPage` you should replace this to suit your needs.
 */
export function ErrorBoundary() {
  let tagline = 'Oopsy daisy';
  let headline = 'Unexpected error';
  let description = "We couldn't handle your request. Please try again later.";

  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    tagline = `${error.status} error`;
    headline = error.statusText;
    description = error.data;
  }

  return (
    <DefaultSparseErrorPage
      tagline={tagline}
      headline={headline}
      description={description}
    />
  );
}

/**
 * In Remix v2 there will only be a `ErrorBoundary`
 * As mentioned in the jsdoc for `DefaultSparseErrorPage` you should replace this to suit your needs.
 * Relevant for the future: https://remix.run/docs/en/main/route/error-boundary-v2
 */
export function CatchBoundary() {
  return ErrorBoundary();
}
