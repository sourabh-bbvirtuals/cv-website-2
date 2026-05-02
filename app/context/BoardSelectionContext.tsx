import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { useRevalidator } from '@remix-run/react';

export interface BoardOption {
  slug: string;
  class: string;
  board: string;
  label: string;
}

interface BoardSelectionContextValue {
  selectedSlug: string;
  boardOptions: BoardOption[];
  setSelectedBoard: (slug: string) => void;
}

const BoardSelectionContext = createContext<BoardSelectionContextValue>({
  selectedSlug: '',
  boardOptions: [],
  setSelectedBoard: () => {},
});

const COOKIE_NAME = 'bb-selected-board';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function BoardSelectionProvider({
  selectedSlug,
  boardOptions,
  children,
}: {
  selectedSlug: string;
  boardOptions: BoardOption[];
  children: React.ReactNode;
}) {
  const revalidator = useRevalidator();
  const [localSlug, setLocalSlug] = useState(selectedSlug);

  useEffect(() => {
    setLocalSlug(selectedSlug);
  }, [selectedSlug]);

  const setSelectedBoard = useCallback(
    (slug: string) => {
      setLocalSlug(slug);
      document.cookie = `${COOKIE_NAME}=${slug}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

      const option = boardOptions.find((o) => o.slug === slug);
      if (option) {
        document.cookie = `bb-user-board=${encodeURIComponent(
          option.board,
        )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
        document.cookie = `bb-user-class=${encodeURIComponent(
          option.class.replace(/\D/g, ''),
        )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

        fetch('/api/update-board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board: option.board,
            studentClass: option.class,
          }),
        }).catch(() => {});
      }

      // Defer revalidation by one tick so all document.cookie writes above
      // are committed before the loader re-reads the Cookie request header.
      setTimeout(() => revalidator.revalidate(), 0);
    },
    [revalidator, boardOptions],
  );

  return (
    <BoardSelectionContext.Provider
      value={{ selectedSlug: localSlug, boardOptions, setSelectedBoard }}
    >
      {children}
    </BoardSelectionContext.Provider>
  );
}

export function useBoardSelection() {
  return useContext(BoardSelectionContext);
}

export function parseBoardCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
