import { json } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { getBlogCollections } from '~/providers/blog/blog-collections';

export interface BlogApiItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { blogs } = await getBlogCollections({ request });
    const list: BlogApiItem[] = blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      content: '',
      image: b.image || '',
      author:
        typeof b.author === 'object' && b.author?.name ? b.author.name : '',
      date: b.publishedAt || '',
      tags: Array.isArray(b.tags) ? b.tags : [],
    }));
    // Sort by date descending (latest first)
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return json(list);
  } catch (e) {
    console.error('api.blogs loader error:', e);
    return json([]);
  }
}
