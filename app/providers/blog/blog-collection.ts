import { sdk } from '~/graphqlWrapper';
import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

export interface BlogCollectionData {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  htmlContent?: string | null;
  blocks?: Array<{
    headingType: string;
    contentType: string;
    heading: string;
    content: string | string[] | { headers?: string[]; rows?: string[][] };
  }>;
  image: string;
  author: {
    name: string;
    role: string;
    image: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  featured: boolean;
}

function normalizeAuthor(author: unknown): {
  name: string;
  role: string;
  image: string;
} {
  if (typeof author === 'string' && author.trim()) {
    return { name: author.trim(), role: '', image: '' };
  }
  if (author && typeof author === 'object' && 'name' in author) {
    const a = author as Record<string, string>;
    return { name: a.name || '', role: a.role || '', image: a.image || '' };
  }
  return { name: '', role: '', image: '' };
}

/**
 * When all posts live in the "blogs" collection CustomData as a JSON array,
 * find one entry by post slug.
 */
async function getBlogPostFromBlogsArray(
  postSlug: string,
  options: QueryOptions,
): Promise<BlogCollectionData | null> {
  const result = await getCollectionBySlug('blogs', options);
  const raw = result.collection?.customFields?.customData;
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  let posts: unknown[] = [];
  if (Array.isArray(parsed)) posts = parsed;
  else if (parsed && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>;
    if (Array.isArray(o.posts)) posts = o.posts;
    else if (Array.isArray(o.blogs)) posts = o.blogs;
  }
  const entry = posts.find(
    (p) =>
      p &&
      typeof p === 'object' &&
      String((p as Record<string, string>).slug) === postSlug,
  ) as Record<string, unknown> | undefined;
  if (!entry) return null;

  const content =
    (entry.content as string) ||
    (entry.htmlContent as string) ||
    (entry.body as string) ||
    '';
  const featuredImage = (result.collection?.featuredAsset?.preview ||
    result.collection?.assets?.[0]?.preview ||
    (entry.image as string) ||
    '') as string;

  return {
    id: String(entry.id ?? postSlug),
    slug: String(entry.slug ?? postSlug),
    title: String(entry.title ?? 'Untitled'),
    excerpt: typeof entry.excerpt === 'string' ? entry.excerpt : '',
    htmlContent: content,
    blocks: Array.isArray(entry.blocks) ? (entry.blocks as any) : [],
    image: featuredImage,
    author: normalizeAuthor(entry.author),
    category: String(entry.category ?? 'General'),
    tags: Array.isArray(entry.tags) ? (entry.tags as string[]) : [],
    publishedAt: String(
      entry.publishedAt ?? entry.date ?? new Date().toISOString().split('T')[0],
    ),
    readTime: String(entry.readTime ?? '5 min read'),
    featured: Boolean(entry.featured),
  };
}

/**
 * Fetch blog data from Vendure collection by slug (one collection per post),
 * or from the "blogs" collection CustomData JSON array.
 */
export async function getBlogCollectionBySlug(
  slug: string,
  options: QueryOptions,
): Promise<BlogCollectionData | null> {
  try {
    console.log(`Fetching blog collection with slug: "${slug}"`);

    const result = await getCollectionBySlug(slug, options);

    if (result.collection?.customFields?.customData) {
      let blogData: Record<string, unknown>;
      try {
        blogData = JSON.parse(
          result.collection.customFields.customData,
        ) as Record<string, unknown>;
      } catch (parseError) {
        console.error(
          `❌ Error parsing custom data for blog collection "${slug}":`,
          parseError,
        );
        return getBlogPostFromBlogsArray(slug, options);
      }

      // Single-object customData (not the parent blogs array)
      if (!Array.isArray(blogData)) {
        const featuredImage =
          result.collection.featuredAsset?.preview ||
          (result.collection.assets && result.collection.assets.length > 0
            ? result.collection.assets[0].preview
            : '') ||
          (blogData.image as string) ||
          '';

        const blog: BlogCollectionData = {
          id: (blogData.id as string) || result.collection.id,
          slug: (blogData.slug as string) || result.collection.slug,
          title: (blogData.title as string) || result.collection.name,
          excerpt: typeof blogData.excerpt === 'string' ? blogData.excerpt : '',
          htmlContent:
            (blogData.htmlContent as string) ||
            (blogData.content as string) ||
            '',
          blocks: (blogData.blocks as any) || [],
          image: featuredImage,
          author: normalizeAuthor(blogData.author),
          category: (blogData.category as string) || 'General',
          tags: Array.isArray(blogData.tags) ? (blogData.tags as string[]) : [],
          publishedAt:
            (blogData.publishedAt as string) ||
            (blogData.date as string) ||
            new Date().toISOString().split('T')[0],
          readTime: (blogData.readTime as string) || '5 min read',
          featured: Boolean(blogData.featured),
        };

        console.log(`✅ Successfully loaded blog collection "${slug}"`);
        return blog;
      }
    }

    const fromArray = await getBlogPostFromBlogsArray(slug, options);
    if (fromArray) {
      console.log(`✅ Loaded blog "${slug}" from blogs CustomData array`);
      return fromArray;
    }

    console.log(`❌ No blog found for slug: "${slug}"`);
    return null;
  } catch (error) {
    console.error(
      `❌ Error fetching blog collection "${slug}":`,
      error instanceof Error ? error.message : error,
    );
    const fromArray = await getBlogPostFromBlogsArray(slug, options);
    return fromArray;
  }
}
