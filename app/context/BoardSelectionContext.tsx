import { createContext, useContext, useCallback, useState, useEffect } from 'react';
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
      revalidator.revalidate();
    },
    [revalidator],
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
