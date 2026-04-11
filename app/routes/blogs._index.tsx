import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/server-runtime';
import { Link, useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import { getBlogCollections } from '~/providers/blog/blog-collections';

export const meta: MetaFunction = () => [
  { title: 'Blog' },
  { name: 'description', content: 'Our news and our take on the things shaping the human-media experience.' },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { blogs } = await getBlogCollections({ request });
  const list = blogs
    .map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      image: b.image || '',
      author: typeof b.author === 'object' && b.author?.name ? b.author.name : '',
      date: b.publishedAt || '',
      category: b.category || 'General',
      readTime: b.readTime || '5 min read',
      tags: Array.isArray(b.tags) ? b.tags : [],
    }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return json({ blogs: list });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
};

function BlogCard({ blog, featured }: { blog: BlogItem; featured?: boolean }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="pb-7 border-b border-slate-900/20 inline-flex flex-col justify-start items-start gap-7 overflow-hidden group"
    >
      {blog.image ? (
        <img
          className={`self-stretch object-cover rounded-sm ${featured ? 'h-96' : 'h-72'}`}
          src={blog.image}
          alt={blog.title}
        />
      ) : (
        <div
          className={`self-stretch bg-slate-100 rounded-sm flex items-center justify-center ${featured ? 'h-96' : 'h-72'}`}
        >
          <span className="text-slate-400 text-sm">No image</span>
        </div>
      )}
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="inline-flex justify-start items-start gap-2">
          <div className="px-3 py-1 rounded outline outline-1 outline-offset-[-1px] outline-slate-900/10 flex justify-center items-center gap-2">
            <span className="text-slate-900/50 text-base font-medium font-['Geist'] leading-5">
              {blog.category}
            </span>
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <h2 className="self-stretch text-slate-900 text-2xl font-medium font-['Geist'] leading-9 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {blog.title}
            </h2>
          </div>
          <div className="flex flex-col justify-start items-start gap-2">
            {blog.author && (
              <div className="inline-flex justify-start items-center gap-2">
                <span className="opacity-50 text-slate-900 text-sm font-medium font-['Geist_Mono'] uppercase leading-4 tracking-wide">
                  BY {blog.author}
                </span>
              </div>
            )}
            <div className="inline-flex justify-center items-center gap-2.5">
              <span className="opacity-50 text-slate-900 text-sm font-medium font-['Geist'] leading-4">
                {formatDate(blog.date)}
              </span>
              <div className="w-1 h-1 opacity-10 bg-slate-900 rounded-full" />
              <span className="opacity-50 text-slate-900 text-sm font-medium font-['Geist'] leading-4 uppercase">
                {blog.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogListingPage() {
  const { blogs } = useLoaderData<typeof loader>();

  const featured = blogs.slice(0, 2);
  const rest = blogs.slice(2);

  const rows: BlogItem[][] = [];
  for (let i = 0; i < rest.length; i += 3) {
    rows.push(rest.slice(i, i + 3));
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-violet-50 pt-14 md:pt-36 xl:pt-40">
        <div className="relative z-10 pt-14 sm:pt-13 md:pt-16 xl:pt-20">
            <div className="custom-container pb-12 lg:pb-16 flex flex-col items-center gap-4">
            <h1 className="text-center text-slate-900 text-5xl font-semibold font-['Geist'] leading-[48px]">
              Blog
            </h1>
            <p className="text-center text-slate-900 text-base font-normal font-['Geist'] leading-6">
              Our news and our take on the things shaping the human-media experience.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <div className="w-full bg-white pb-20">
        <div className="custom-container pt-10 flex flex-col gap-10">
          {blogs.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-lg">
              No blog posts yet. Check back soon.
            </div>
          )}

          {/* Featured row: 2 large cards */}
          {featured.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
              {featured.map((blog) => (
                <BlogCard key={blog.id} blog={blog} featured />
              ))}
            </div>
          )}

          {/* Regular rows: 3 cards each */}
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
              {row.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
