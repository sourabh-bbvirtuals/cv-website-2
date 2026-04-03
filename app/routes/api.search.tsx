import { json } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { search } from '~/providers/products/products';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (!q || q.trim().length < 2) {
    return json({ items: [], totalItems: 0 });
  }

  try {
    const result = await search(
      { input: { term: q.trim(), groupByProduct: true, take: 6 } },
      { request },
    );
    return json({
      items: result.search.items,
      totalItems: result.search.totalItems,
    });
  } catch {
    return json({ items: [], totalItems: 0 });
  }
}
