import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';

export async function loader({ params, request }: DataFunctionArgs) {
  const slug = params.slug;
  if (!slug) {
    throw new Response('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  // Redirect legacy/new routes to the collection listing page.
  return redirect(
    `/products2/${encodeURIComponent(slug)}${url.search}${url.hash}`,
  );
}

export default function Courses2SlugRedirect() {
  // Loader will always redirect.
  return null;
}
