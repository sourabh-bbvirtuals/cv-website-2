import type { LoaderFunctionArgs } from '@remix-run/node';
import { API_URL } from '~/constants';
import { getBlogCollections } from '~/providers/blog/blog-collections';

const SITE_URL = 'https://commercevirtuals.com';

const FREE_RESOURCE_TABS = [
  'mock-tests',
  'quizzes',
  'past-papers',
  'free-videos',
  'study-notes',
];

async function fetchProductSlugs(): Promise<string[]> {
  try {
    const apiUrl = API_URL;
    const allSlugs: string[] = [];
    let skip = 0;
    const take = 100;

    while (true) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query($options: ProductListOptions) { products(options: $options) { totalItems items { slug } } }`,
          variables: { options: { take, skip } },
        }),
      });
      const result = (await response.json()) as {
        data?: {
          products?: { totalItems: number; items: Array<{ slug: string }> };
        };
      };
      const items = result?.data?.products?.items || [];
      allSlugs.push(...items.map((p) => p.slug));
      if (items.length < take) break;
      skip += take;
    }

    return allSlugs;
  } catch (e) {
    console.error('Sitemap: failed to fetch products', e);
    return [];
  }
}

async function fetchBlogSlugs(request: Request): Promise<string[]> {
  try {
    const { blogs } = await getBlogCollections({ request });
    return blogs.map((b) => b.slug);
  } catch (e) {
    console.error('Sitemap: failed to fetch blogs', e);
    return [];
  }
}

function buildSitemapXml(
  urls: Array<{ loc: string; priority?: string; changefreq?: string }>,
) {
  const entries = urls
    .map(
      ({ loc, priority = '0.7', changefreq = 'weekly' }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const [productSlugs, blogSlugs] = await Promise.all([
    fetchProductSlugs(),
    fetchBlogSlugs(request),
  ]);

  const urls: Array<{ loc: string; priority?: string; changefreq?: string }> =
    [];

  urls.push({
    loc: `${SITE_URL}/our-courses`,
    priority: '1.0',
    changefreq: 'daily',
  });

  for (const slug of productSlugs) {
    urls.push({
      loc: `${SITE_URL}/our-courses/${slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  }

  urls.push({ loc: `${SITE_URL}/blogs`, priority: '0.8', changefreq: 'daily' });

  for (const slug of blogSlugs) {
    urls.push({
      loc: `${SITE_URL}/blogs/${slug}`,
      priority: '0.6',
      changefreq: 'weekly',
    });
  }

  urls.push({
    loc: `${SITE_URL}/free-resources`,
    priority: '0.9',
    changefreq: 'daily',
  });

  for (const tab of FREE_RESOURCE_TABS) {
    urls.push({
      loc: `${SITE_URL}/free-resources/${tab}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  }

  const xml = buildSitemapXml(urls);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
