import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/server-runtime';
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
 * The HTML editor wraps each line in <div>…</div> and escapes actual
 * HTML tags as &lt; / &gt;.  Undo that so the raw HTML renders properly.
 */
function decodeEditorHtml(raw: string): string {
  if (!raw) return raw;
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
  const url = typeof window !== 'undefined' ? window.location.href : `/blogs/${slug}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex justify-start items-center gap-3">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Share on Facebook"
      >
        <svg className="w-6 h-6 opacity-30 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Share on X"
      >
        <svg className="w-6 h-6 opacity-30 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-6 h-6 opacity-30 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Share on WhatsApp"
      >
        <svg className="w-6 h-6 opacity-30 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : `/blogs/${slug}`);
          }
        }}
        className="p-2 bg-white/50 rounded-lg flex justify-start items-center gap-2.5 hover:bg-slate-100 transition-colors"
        aria-label="Copy link"
      >
        <svg className="w-6 h-6 opacity-30 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-4.243a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.88 9.121" />
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
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 flex flex-col items-center gap-12">
          {/* Header section */}
          <div className="self-stretch pb-12 border-b border-slate-900/20 flex flex-col justify-start items-start gap-12">
            <div className="self-stretch flex flex-col justify-start items-start gap-7">
              {/* Breadcrumb */}
              <nav className="inline-flex justify-start items-center gap-2.5 flex-wrap content-center">
                <Link to="/blogs" className="opacity-50 flex justify-center items-center gap-2.5 hover:opacity-70 transition-opacity">
                  <span className="text-slate-900 text-xs font-normal font-['Geist']">Blog</span>
                </Link>
                <div className="w-4 h-4 relative opacity-50 flex items-center justify-center">
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-slate-900">
                    <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
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

            {/* Featured Image */}
            {b.image && (
              <img
                className="self-stretch w-full h-auto max-h-[600px] object-cover rounded-lg"
                src={b.image}
                alt={b.title}
              />
            )}
          </div>

          {/* Blog Content */}
          <div className="self-stretch pb-12 border-b border-slate-900/20">
            {b.htmlContent ? (
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
                dangerouslySetInnerHTML={{ __html: decodeEditorHtml(b.htmlContent) }}
              />
            ) : (
              <div className="flex flex-col gap-12">
                {b.blocks?.map((block, i) => (
                  <div key={i} className="self-stretch flex flex-col justify-start items-start gap-6">
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
                        <p key={j} className="self-stretch text-slate-900 text-base font-normal font-['Geist'] leading-6">
                          {line}
                        </p>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {b.tags && b.tags.length > 0 && (
            <div className="self-stretch flex flex-wrap gap-2">
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

          {/* Back to Blog */}
          <div className="self-stretch">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to all posts
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
