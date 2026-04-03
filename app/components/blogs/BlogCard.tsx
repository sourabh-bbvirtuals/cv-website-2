import { Link } from '@remix-run/react';
import type { BlogItem } from './types';

interface BlogCardProps {
  blog: BlogItem;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d
      .toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .toUpperCase();
  } catch {
    return dateStr;
  }
}

export function BlogCard({ blog }: BlogCardProps) {
  const dateFormatted = formatDate(blog.date);
  const categoryLabel = blog.tags?.length ? blog.tags[0].toUpperCase() : '';

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Link to={`/blogs/${blog.slug}`} className="block">
        <div className="aspect-[2/1] w-full overflow-hidden bg-gray-100">
          <img
            src={blog.image || '/assets/logo.png'}
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          {dateFormatted}
          {blog.author ? ` / BY ${blog.author.toUpperCase()}` : ''}
        </p>
        <Link to={`/blogs/${blog.slug}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-3">
            {blog.title}
          </h2>
        </Link>
        {blog.excerpt && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {blog.excerpt}
          </p>
        )}
        <hr className="border-gray-100 my-4" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {categoryLabel && (
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
              {categoryLabel}
            </span>
          )}
          <Link
            to={`/blogs/${blog.slug}`}
            className="text-sm font-bold text-gray-900 hover:text-brand-600 transition-colors"
          >
            Read More &gt;
          </Link>
        </div>
      </div>
    </article>
  );
}
