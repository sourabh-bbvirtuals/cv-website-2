import {
  parseBoardCookie,
  type BoardOption,
} from '~/context/BoardSelectionContext';
import { API_URL } from '~/constants';

/**
 * Resolves the navbar board/class selection from cookies and Vendure,
 * returning the board and class labels (e.g. { board: "CBSE", class: "XII" }).
 * Falls back to the first available option if no cookie is set.
 */
export async function resolveNavbarBoardSelection(
  request: Request,
): Promise<{ board: string; class: string } | null> {
  const cookieHeader = request.headers.get('Cookie');
  const cookieSlug = parseBoardCookie(cookieHeader);

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

    if (boardOptions.length === 0) return null;

    let selected = cookieSlug
      ? boardOptions.find((o) => o.slug === cookieSlug) ?? null
      : null;

    if (!selected && cookieHeader) {
      const boardMatch = cookieHeader.match(/bb-user-board=([^;]*)/);
      const classMatch = cookieHeader.match(/bb-user-class=([^;]*)/);
      if (boardMatch) {
        const userBoard = decodeURIComponent(boardMatch[1]).toLowerCase();
        const userClass = classMatch
          ? decodeURIComponent(classMatch[1]).replace(/\D/g, '')
          : '';
        selected =
          boardOptions.find((o) => {
            const oBoard = o.board.toLowerCase();
            const oClass = o.class.replace(/\D/g, '');
            return (
              oBoard.includes(userBoard) &&
              userClass &&
              oClass.includes(userClass)
            );
          }) ??
          boardOptions.find((o) => o.board.toLowerCase().includes(userBoard)) ??
          null;
      }
    }

    // If no cookie was present at all, return null so loaders know to use
    // their own first-visit default (boards[0]) rather than treating this
    // as an explicit user selection.
    if (!cookieSlug && !selected) return null;

    // Cookie was set but points to a stale/unknown slug — fuzzy fallback is fine
    if (!selected) selected = boardOptions[0];

    return { board: selected.board, class: selected.class };
  } catch {
    return null;
  }
}
