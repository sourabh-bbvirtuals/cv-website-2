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

  useEffect(() => {
    if (selectedSlug || boardOptions.length === 0) return;
    try {
      const stored = localStorage.getItem('bb_user_profile');
      if (!stored) return;
      const profile = JSON.parse(stored);
      const userBoard = (profile.board || '').toLowerCase();
      const userClass = (profile.classLevel || '').replace(/\D/g, '');
      if (!userBoard) return;

      const match = boardOptions.find((o) => {
        const oBoard = o.board.toLowerCase();
        const oClass = o.class.toLowerCase().replace(/\D/g, '');
        return oBoard.includes(userBoard) && (!userClass || oClass.includes(userClass));
      }) || boardOptions.find((o) => o.board.toLowerCase().includes(userBoard));

      if (match) {
        setLocalSlug(match.slug);
        document.cookie = `${COOKIE_NAME}=${match.slug}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
        revalidator.revalidate();
      }
    } catch {}
  }, [boardOptions, selectedSlug, revalidator]);

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
