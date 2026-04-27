import { Outlet, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  BoardSelectionProvider,
  parseBoardCookie,
  type BoardOption,
} from '~/context/BoardSelectionContext';
import { API_URL } from '~/constants';

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieSlug = parseBoardCookie(request.headers.get('Cookie'));
  try {
    const parentResult = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query homePageParent {
          collection(slug: "home-page") {
            id
            children { id name slug customFields { customData } }
          }
        }`,
      }),
    })
      .then((r) => r.json())
      .then((r: any) => r.data?.collection)
      .catch(() => null);

    const children: any[] = parentResult?.children || [];
    const boardOptions: BoardOption[] = children
      .map((c: any) => {
        if (!c.customFields?.customData) return null;
        try {
          const parsed = JSON.parse(c.customFields.customData);
          if (parsed.class && parsed.board)
            return { slug: c.slug, ...parsed } as BoardOption;
        } catch {}
        return null;
      })
      .filter(Boolean) as BoardOption[];

    let selectedSlug =
      cookieSlug && boardOptions.some((o) => o.slug === cookieSlug)
        ? cookieSlug
        : '';

    if (!selectedSlug && boardOptions.length > 0) {
      const cookies = request.headers.get('Cookie') || '';
      const boardMatch = cookies.match(/bb-user-board=([^;]*)/);
      const classMatch = cookies.match(/bb-user-class=([^;]*)/);
      if (boardMatch) {
        const userBoard = decodeURIComponent(boardMatch[1]).toLowerCase();
        const userClass = classMatch
          ? decodeURIComponent(classMatch[1]).replace(/\D/g, '')
          : '';
        const matched =
          boardOptions.find((o) => {
            const oBoard = o.board.toLowerCase();
            const oClass = o.class.replace(/\D/g, '');
            return (
              oBoard.includes(userBoard) &&
              userClass &&
              oClass.includes(userClass)
            );
          }) ||
          boardOptions.find((o) => o.board.toLowerCase().includes(userBoard));
        if (matched) selectedSlug = matched.slug;
      }
    }

    return json({ boardOptions, selectedSlug });
  } catch {
    return json({ boardOptions: [] as BoardOption[], selectedSlug: '' });
  }
}

export default function FreeResourcesLayoutRoute() {
  const { boardOptions, selectedSlug } = useLoaderData<typeof loader>();

  return (
    <BoardSelectionProvider
      selectedSlug={selectedSlug}
      boardOptions={boardOptions}
    >
      <Outlet />
    </BoardSelectionProvider>
  );
}
