import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/server-runtime';
import { Link, useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import { getBlogCollectionBySlug } from '~/providers/blog/blog-collection';
import type { BlogCollectionData } from '~/providers/blog/blog-collection';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.blog) return [{ title: 'Blog Not Found' }];
  const b = data.blog;
  return [
    { title: b.title },
    { name: 'description', content: b.excerpt || b.title },
    { property: 'og:title', content: b.title },
    { property: 'og:description', content: b.excerpt || b.title },
    { property: 'og:image', content: b.image || '' },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: b.title },
    { name: 'twitter:description', content: b.excerpt || b.title },
    { name: 'twitter:image', content: b.image || '' },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) throw new Response('Not Found', { status: 404 });

  const blog = await getBlogCollectionBySlug(slug, { request });
  if (!blog) throw new Response('Not Found', { status: 404 });

  return json({ blog });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

/**
 * Returns true if the HTML is a fully structured blog post with its own
 * styles/classes (not editor-wrapped content that needs unescaping).
 */
function isRichHtml(raw: string): boolean {
  return /<style[\s>]/i.test(raw) || /class="[^"]+"/i.test(raw);
}

/**
 * The HTML editor wraps each line in <div>…</div> and escapes actual
 * HTML tags as &lt; / &gt;.  Undo that so the raw HTML renders properly.
 * Only applied to simple editor-wrapped content, not rich HTML.
 */
function decodeEditorHtml(raw: string): string {
  if (!raw) return raw;
  if (isRichHtml(raw)) return raw;
  let html = raw
    .replace(/<div>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return html;
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const handleShare = async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : `/blogs/${slug}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or share failed silently
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex justify-start items-center">
      <button
        type="button"
        onClick={handleShare}
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Share this post"
      >
        <svg
          className="w-6 h-6 opacity-30 text-slate-900"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z"
          />
        </svg>
      </button>
    </div>
  );
}

export default function BlogDetailPage() {
  const { blog } = useLoaderData<typeof loader>();
  const b = blog as BlogCollectionData;

  const dateFormatted = formatDate(b.publishedAt);
  const authorName = b.author?.name || 'Unknown';

  return (
    <Layout>
      <div className="pt-36 lg:pt-48 pb-16 min-h-screen bg-white">
        <div className="custom-container flex flex-col items-center gap-12">
          {/* Header section */}
          <div className="self-stretch pb-12 border-b border-slate-900/20 flex flex-col justify-start items-start gap-12">
            <div className="self-stretch flex flex-col justify-start items-start gap-7">
              {/* Tags */}
              {b.tags && b.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {b.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Breadcrumb */}
              <nav className="inline-flex justify-start items-center gap-2.5 flex-wrap content-center">
                <Link
                  to="/blogs"
                  className="opacity-50 flex justify-center items-center gap-2.5 hover:opacity-70 transition-opacity"
                >
                  <span className="text-slate-900 text-xs font-normal font-['Geist']">
                    Blog
                  </span>
                </Link>
                <div className="w-4 h-4 relative opacity-50 flex items-center justify-center">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    className="text-slate-900"
                  >
                    <path
                      d="M1 1L5 5L1 9"
                      stroke="currentColor"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex justify-center items-center gap-2.5">
                  <span className="text-slate-900 text-xs font-normal font-['Geist']">
                    {truncate(b.title, 25)}
                  </span>
                </div>
              </nav>

              {/* Title */}
              <h1 className="self-stretch text-slate-900 text-3xl sm:text-4xl font-semibold font-['Geist'] leading-[44px] sm:leading-[56px]">
                {b.title}
              </h1>

              {/* Author & Share Row */}
              <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-2.5">
                <div className="flex-1 flex flex-col justify-start items-start gap-2">
                  <div className="opacity-50 text-slate-900 text-sm font-medium font-['Geist_Mono'] uppercase leading-4 tracking-wide">
                    BY {authorName}
                  </div>
                  <div className="flex justify-center items-center gap-2.5">
                    <span className="opacity-50 text-slate-900 text-sm font-medium font-['Geist'] leading-4">
                      {dateFormatted}
                    </span>
                    <div className="w-1 h-1 opacity-10 bg-slate-900 rounded-full" />
                    <span className="opacity-50 text-slate-900 text-sm font-medium font-['Geist'] leading-4">
                      {b.readTime}
                    </span>
                  </div>
                </div>
                <ShareButtons title={b.title} slug={b.slug} />
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="self-stretch pb-12 border-b border-slate-900/20">
            {b.htmlContent ? (
              isRichHtml(b.htmlContent) ? (
                <article
                  className="max-w-none blog-full-width"
                  dangerouslySetInnerHTML={{ __html: b.htmlContent }}
                />
              ) : (
                <article
                  className="prose prose-slate prose-lg max-w-none
                  prose-headings:font-['Geist'] prose-headings:text-slate-900 prose-headings:font-semibold
                  prose-h2:text-2xl prose-h2:leading-7 prose-h2:mb-6 prose-h2:mt-12 first:prose-h2:mt-0
                  prose-h3:text-xl prose-h3:font-medium prose-h3:leading-6
                  prose-p:text-base prose-p:font-normal prose-p:font-['Geist'] prose-p:leading-6 prose-p:text-slate-900
                  prose-blockquote:pl-7 prose-blockquote:pr-6 prose-blockquote:pt-4 prose-blockquote:bg-violet-50
                  prose-blockquote:rounded-tr-xl prose-blockquote:rounded-br-xl prose-blockquote:border-l-[3px]
                  prose-blockquote:border-blue-500 prose-blockquote:not-italic
                  prose-blockquote:text-slate-900/70 prose-blockquote:text-lg prose-blockquote:font-normal prose-blockquote:leading-8
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-img:rounded-lg prose-img:w-full
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{
                    __html: decodeEditorHtml(b.htmlContent),
                  }}
                />
              )
            ) : (
              <div className="flex flex-col gap-12">
                {b.blocks?.map((block, i) => (
                  <div
                    key={i}
                    className="self-stretch flex flex-col justify-start items-start gap-6"
                  >
                    {block.heading && (
                      <h2 className="self-stretch text-slate-900 text-2xl font-semibold font-['Geist'] leading-7">
                        {block.heading}
                      </h2>
                    )}
                    {typeof block.content === 'string' && (
                      <p className="self-stretch text-slate-900 text-base font-normal font-['Geist'] leading-6">
                        {block.content}
                      </p>
                    )}
                    {Array.isArray(block.content) &&
                      block.content.map((line, j) => (
                        <p
                          key={j}
                          className="self-stretch text-slate-900 text-base font-normal font-['Geist'] leading-6"
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back to Blog */}
          <div className="self-stretch">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to all posts
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
