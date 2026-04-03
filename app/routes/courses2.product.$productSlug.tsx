import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';

export async function loader({ params, request }: DataFunctionArgs) {
  const productSlug = params.productSlug;
  if (!productSlug) {
    throw new Response('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  // Redirect legacy/new routes to the product detail page.
  return redirect(
    `/product/${encodeURIComponent(productSlug)}${url.search}${url.hash}`,
  );
}

export default function Courses2ProductRedirect() {
  // Loader will always redirect.
  return null;
}
