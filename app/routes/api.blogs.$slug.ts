import { json } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { getBlogCollectionBySlug } from '~/providers/blog/blog-collection';

export interface BlogDetailApiItem {
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

function blocksToHtml(
  blocks:
    | Array<{
        heading?: string;
        contentType?: string;
        headingType?: string;
        content?: string | string[] | { headers?: string[]; rows?: string[][] };
      }>
    | undefined,
): string {
  if (!blocks?.length) return '';
  const parts: string[] = [];
  for (const block of blocks) {
    const heading = block.heading || (block as any).headingType;
    const content = block.content;
    if (heading) parts.push(`<h3>${escapeHtml(heading)}</h3>`);
    if (content != null) {
      if (Array.isArray(content)) {
        parts.push(
          content.map((c) => `<p>${escapeHtml(String(c))}</p>`).join(''),
        );
      } else if (typeof content === 'string') {
        parts.push(`<p>${escapeHtml(content)}</p>`);
      }
    }
  }
  return parts.join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug) {
    return json(null, { status: 400 });
  }
  try {
    const blog = await getBlogCollectionBySlug(slug, { request });
    if (!blog) {
      return json(null, { status: 404 });
    }
    const content = blog.htmlContent || blocksToHtml(blog.blocks as any) || '';
    const item: BlogDetailApiItem = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content,
      image: blog.image || '',
      author:
        typeof blog.author === 'object' && blog.author?.name
          ? blog.author.name
          : '',
      date: blog.publishedAt || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
    };
    return json(item);
  } catch (e) {
    console.error('api.blogs.$slug loader error:', e);
    return json(null, { status: 500 });
  }
}
