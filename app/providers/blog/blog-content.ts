import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '~/providers/collections/collections';

export interface CollectionContentItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
  rating?: number;
  fileUrl?: string;
}

function parseItems(raw: string | null | undefined): CollectionContentItem[] {
  if (!raw?.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  let list: unknown[] = [];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.posts)) list = obj.posts;
    else if (Array.isArray(obj.blogs)) list = obj.blogs;
    else if (Array.isArray(obj.items)) list = obj.items;
    else if (Array.isArray(obj.notes)) list = obj.notes;
    else if (Array.isArray(obj.reviews)) list = obj.reviews;
  }

  return list.map((entry, idx) => {
    const item =
      entry && typeof entry === 'object'
        ? (entry as Record<string, unknown>)
        : {};
    const author =
      typeof item.author === 'string'
        ? item.author
        : typeof item.name === 'string'
        ? item.name
        : typeof item.author === 'object' &&
          item.author &&
          'name' in item.author
        ? String((item.author as Record<string, unknown>).name || '')
        : '';

    const title =
      typeof item.title === 'string'
        ? item.title
        : typeof item.course === 'string'
        ? item.course
        : 'Review';

    const content =
      typeof item.content === 'string'
        ? item.content
        : typeof item.comment === 'string'
        ? item.comment
        : typeof item.htmlContent === 'string'
        ? item.htmlContent
        : typeof item.body === 'string'
        ? item.body
        : '';

    const image =
      typeof item.image === 'string'
        ? item.image
        : typeof item.avatar === 'string'
        ? item.avatar
        : '';
    return {
      id: String(item.id ?? `${idx}`),
      slug: String(item.slug ?? `item-${idx}`),
      title: String(title),
      excerpt: String(item.excerpt ?? item.description ?? ''),
      content: String(content),
      image: String(image),
      author,
      date: String(
        item.date ?? item.publishedAt ?? new Date().toISOString().split('T')[0],
      ),
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      rating:
        typeof item.rating === 'number'
          ? item.rating
          : typeof item.rating === 'string'
          ? Number(item.rating)
          : undefined,
      fileUrl: typeof item.fileUrl === 'string' ? item.fileUrl : undefined,
    };
  });
}

export async function getCollectionContentBySlug(
  slug: string,
  options: QueryOptions,
): Promise<CollectionContentItem[]> {
  try {
    const { collection } = await getCollectionBySlug(slug, options);
    if (!collection?.customFields?.customData) return [];
    return parseItems(collection.customFields.customData);
  } catch {
    return [];
  }
}
