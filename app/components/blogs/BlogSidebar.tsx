import { Link } from '@remix-run/react';
import { SearchIcon } from 'lucide-react';
import type { BlogItem } from './types';

interface BlogSidebarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  recentPosts: BlogItem[];
}

const RECENT_COUNT = 5;

export function BlogSidebar({
  searchValue,
  onSearchChange,
  recentPosts,
}: BlogSidebarProps) {
  const recent = recentPosts.slice(0, RECENT_COUNT);

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">Search</h3>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            aria-label="Search blogs"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">Recent Posts</h3>
        <ul className="space-y-3">
          {recent.length === 0 ? (
            <li className="text-sm text-gray-500">No posts yet.</li>
          ) : (
            recent.map((post) => (
              <li key={post.id}>
                <Link to={`/blogs/${post.slug}`} className="flex gap-3 group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={post.image || '/assets/logo.png'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-brand-600 line-clamp-2 flex-1 min-w-0">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
