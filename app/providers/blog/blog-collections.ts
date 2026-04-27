import { sdk } from '~/graphqlWrapper';
import type { QueryOptions } from '~/graphqlWrapper';
import { SortOrder } from '~/generated/graphql';
import { getCollectionBySlug } from '~/providers/collections/collections';

export interface BlogCollectionItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
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
  children?: BlogCollectionItem[];
}

export interface BlogCollectionsData {
  blogs: BlogCollectionItem[];
  totalItems: number;
}

/** Parse CustomData JSON: supports top-level array `[{...}]` or `{ posts: [...] }` / `{ blogs: [...] }`. */
function parseBlogsFromCustomDataString(
  json: string | null | undefined,
): BlogCollectionItem[] {
  if (!json?.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.warn('⚠️ blogs customData is not valid JSON');
    return [];
  }

  let posts: unknown[] = [];
  if (Array.isArray(parsed)) {
    posts = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>;
    if (Array.isArray(o.posts)) posts = o.posts;
    else if (Array.isArray(o.blogs)) posts = o.blogs;
  }

  return posts.map((p, index) => mapRawPostToBlogItem(p, index));
}

function mapRawPostToBlogItem(p: unknown, index: number): BlogCollectionItem {
  const item = p && typeof p === 'object' ? (p as Record<string, unknown>) : {};
  const authorRaw = item.author;
  let author: { name: string; role: string; image: string } = {};
  if (typeof authorRaw === 'string' && authorRaw.trim()) {
    author = { name: authorRaw.trim(), role: '', image: '' };
  } else if (
    authorRaw &&
    typeof authorRaw === 'object' &&
    'name' in authorRaw
  ) {
    const a = authorRaw as Record<string, string>;
    author = {
      name: a.name || '',
      role: a.role || '',
      image: a.image || '',
    };
  }
  const date =
    (item.publishedAt as string) ||
    (item.date as string) ||
    new Date().toISOString().split('T')[0];
  return {
    id: String(item.id ?? `blog-${index}`),
    slug: String(item.slug ?? `blog-${index}`),
    title: String(item.title ?? 'Untitled'),
    excerpt: String(item.excerpt ?? ''),
    image: String(item.image ?? ''),
    author,
    category: String(item.category ?? 'General'),
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    publishedAt: date,
    readTime: String(item.readTime ?? '5 min read'),
    featured: Boolean(item.featured),
  };
}

function mapChildToBlogItem(child: {
  id: string;
  slug: string;
  name: string;
  description?: string;
  customFields?: { customData?: string | null } | null;
  featuredAsset?: { preview: string } | null;
  assets?: Array<{ preview: string }>;
}): BlogCollectionItem {
  let childBlogData: Record<string, unknown> | null = null;
  const rawJson = child.description || child.customFields?.customData;
  if (rawJson) {
    try {
      childBlogData = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      // ignore
    }
  }
  const childImage =
    (child as any).featuredAsset?.preview ||
    ((child as any).assets?.length ? (child as any).assets[0].preview : '') ||
    (childBlogData?.image as string) ||
    '';
  const author = childBlogData?.author;
  return {
    id: child.id,
    slug: child.slug,
    title: (childBlogData?.title as string) || child.name,
    excerpt: (childBlogData?.excerpt as string) || '',
    image: childImage,
    author:
      author && typeof author === 'object' && 'name' in author
        ? {
            name: (author as any).name,
            role: (author as any).role || '',
            image: (author as any).image || '',
          }
        : {},
    category: (childBlogData?.category as string) || 'General',
    tags: Array.isArray(childBlogData?.tags)
      ? (childBlogData.tags as string[])
      : [],
    publishedAt:
      (childBlogData?.publishedAt as string) ||
      new Date().toISOString().split('T')[0],
    readTime: (childBlogData?.readTime as string) || '5 min read',
    featured: (childBlogData?.featured as boolean) || false,
  };
}

/**
 * Fetch all blog collections with children and images.
 * Expects a Vendure collection with slug "blogs" (case-insensitive) whose children are blog posts,
 * or a "blogs" collection with customData containing a "posts" array.
 */
export async function getBlogCollections(
  options: QueryOptions,
): Promise<BlogCollectionsData> {
  try {
    // 1) Try exact slug filter first
    let result = await sdk.getBlogCollections(
      {
        options: {
          filter: { slug: { eq: 'blogs' } },
          sort: { createdAt: SortOrder.DESC },
          take: 10,
        },
      },
      options,
    );

    let collections = result.collections?.items ?? [];

    // 2) If no collection found, fetch without filter and find by slug (case-insensitive)
    if (collections.length === 0) {
      result = await sdk.getBlogCollections(
        {
          options: {
            sort: { createdAt: SortOrder.DESC },
            take: 100,
          },
        },
        options,
      );
      collections = result.collections?.items ?? [];
      const blogsCollection = collections.find(
        (c) => c.slug?.toLowerCase() === 'blogs',
      );
      if (blogsCollection) {
        collections = [blogsCollection];
      }
    }

    const blogs: BlogCollectionItem[] = [];

    // Private collections are often omitted from `collections` list — load by slug
    if (collections.length === 0) {
      try {
        const { collection: bySlug } = await getCollectionBySlug(
          'blogs',
          options,
        );
        const rawJson = bySlug?.description || bySlug?.customFields?.customData;
        if (rawJson) {
          blogs.push(...parseBlogsFromCustomDataString(rawJson));
        }
      } catch {
        // ignore
      }
      if (blogs.length === 0) {
        console.log(
          '⚠️ No "blogs" collection found via list or slug. Use slug "blogs" and assign it to your shop channel; set visibility so the Shop API can read it.',
        );
        return { blogs: [], totalItems: 0 };
      }
      console.log(
        `✅ Loaded ${blogs.length} blog post(s) from blogs collection (by slug)`,
      );
      return { blogs, totalItems: blogs.length };
    }

    const collection = collections[0];

    // 3) Use children as blog posts (each child = one blog)
    if (collection.children && collection.children.length > 0) {
      for (const child of collection.children) {
        blogs.push(mapChildToBlogItem(child as any));
      }
    } else {
      // 4) No children: description or customData as JSON array
      const fromCustom = parseBlogsFromCustomDataString(
        collection.description || (collection as any).customFields?.customData,
      );
      blogs.push(...fromCustom);
    }

    // 5) Still empty (e.g. list returned collection but no children / empty data)
    if (blogs.length === 0) {
      try {
        const { collection: bySlug } = await getCollectionBySlug(
          'blogs',
          options,
        );
        const rawJson2 =
          bySlug?.description || bySlug?.customFields?.customData;
        if (rawJson2) {
          blogs.push(...parseBlogsFromCustomDataString(rawJson2));
        }
      } catch {
        // ignore
      }
    }

    console.log(`✅ Loaded ${blogs.length} blog post(s) from blogs collection`);
    return {
      blogs,
      totalItems: blogs.length,
    };
  } catch (error) {
    console.error(
      '❌ Error fetching blog collections:',
      error instanceof Error ? error.message : error,
    );
    return { blogs: [], totalItems: 0 };
  }
}
