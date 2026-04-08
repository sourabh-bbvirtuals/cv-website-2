import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { useState, useMemo } from 'react';
import Layout from '~/components/Layout';
import { getBlogCollections } from '~/providers/blog/blog-collections';
import { BlogCard, BlogSidebar, BlogEmptyState } from '~/components/blogs';

export const meta: MetaFunction = () => [
  { title: 'Blog' },
  { name: 'description', content: 'Read our latest articles and insights.' },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { blogs } = await getBlogCollections({ request });
  const list = blogs
    .map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      content: '',
      image: b.image || '',
      author: typeof b.author === 'object' && b.author?.name ? b.author.name : '',
      date: b.publishedAt || '',
      tags: Array.isArray(b.tags) ? b.tags : [],
    }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return json({ blogs: list });
}

export default function BlogListingPage() {
  const { blogs } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [blogs, search]);

  return (
    <Layout>
      <div className="pt-28 lg:pt-36 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 font-['Geist']">
              Blog
            </h1>
            <p className="mt-2 text-slate-500 text-base font-['Geist']">
              Insights, updates, and stories from our team.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <BlogEmptyState />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filtered.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </div>
            <div className="w-full lg:w-72 flex-shrink-0">
              <BlogSidebar
                searchValue={search}
                onSearchChange={setSearch}
                recentPosts={blogs.slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
