/**
 * Server-side utility to resolve the selected boardId and classId from
 * the navbar cookie selection against the available boards/classes from
 * the BB server.
 *
 * Matching is intentionally STRICT when a navSelection cookie exists:
 * if no board or class can be matched, we return empty strings so the
 * caller can show "No Resources Found" rather than silently falling
 * back to an unrelated board/class.
 */

import type { Board, ClassLevel } from './bbServer';

// ── Roman numeral ↔ Arabic number map (Class 11 / 12 only scope) ──────────
const ROMAN_TO_ARABIC: Record<string, string> = {
  i: '1',
  ii: '2',
  iii: '3',
  iv: '4',
  v: '5',
  vi: '6',
  vii: '7',
  viii: '8',
  ix: '9',
  x: '10',
  xi: '11',
  xii: '12',
  xiii: '13',
};

const ARABIC_TO_ROMAN: Record<string, string> = Object.fromEntries(
  Object.entries(ROMAN_TO_ARABIC).map(([r, a]) => [a, r]),
);

/**
 * Normalise a class label to just its numeric digit(s) for comparison.
 * e.g. "Class 11" → "11", "XI" → "11", "12th" → "12", "XII" → "12"
 */
function normalizeClassToDigits(name: string): string {
  const trimmed = name.trim().toLowerCase();

  // 1. Direct Roman numeral match (e.g. "xi", "xii")
  if (ROMAN_TO_ARABIC[trimmed]) return ROMAN_TO_ARABIC[trimmed];

  // 2. Strip non-digit chars and return remaining digits (e.g. "Class 11" → "11")
  const digits = trimmed.replace(/\D/g, '');
  if (digits) return digits;

  return trimmed;
}

/**
 * Returns true when `candidate` matches `target` class label using
 * multiple strategies (exact → digit → Roman numeral equivalence).
 */
function classMatches(candidate: string, target: string): boolean {
  const a = candidate.trim().toLowerCase();
  const b = target.trim().toLowerCase();

  // Strategy 1: exact match
  if (a === b) return true;

  // Strategy 2: digit-normalised match
  const da = normalizeClassToDigits(a);
  const db = normalizeClassToDigits(b);
  if (da && db && da === db) return true;

  // Strategy 3: one side is Roman, other is Arabic (or vice-versa)
  // normalizeClassToDigits already converts Roman → Arabic, so the above covers this.
  // But also check the reverse: if target is a Roman numeral label.
  const romanB = ARABIC_TO_ROMAN[db];
  if (romanB && romanB === a) return true;

  return false;
}

/**
 * Selects the best matching board from `boards` given the navSelection.
 *
 * Returns the boardId string, or '' if navSelection is present but nothing matched.
 * Returns boards[0].id if navSelection is null (first-visit default).
 */
function resolveBoard(
  navSelection: { board: string; class: string } | null,
  boards: Board[],
): string {
  if (boards.length === 0) return '';

  // No cookie / no selection → caller's default (boards[0]) is fine for first visit
  if (!navSelection) return boards[0].id;

  const navBoard = navSelection.board.toLowerCase().trim();

  const matched = boards.find((b) => {
    const bn = b.name.toLowerCase().trim();
    return bn.includes(navBoard) || navBoard.includes(bn);
  });

  // navSelection WAS set, but nothing matched → strict: return ''
  return matched ? matched.id : '';
}

/**
 * Selects the best matching class from `classes` given the navSelection.
 *
 * Returns the classId string, or '' if navSelection is present but nothing matched.
 * Returns classes[0].id if navSelection is null.
 */
function resolveClass(
  navSelection: { board: string; class: string } | null,
  classes: ClassLevel[],
): string {
  if (classes.length === 0) return '';

  // No cookie / no selection → caller's default
  if (!navSelection) return classes[0].id;

  const matched = classes.find((c) => classMatches(c.name, navSelection.class));

  // navSelection WAS set, but nothing matched → strict: return ''
  return matched ? matched.id : '';
}

export interface ResolvedBoardClass {
  /**
   * The resolved boardId. Empty string means "no valid match found when a
   * selection WAS expected" — callers should return no content in this case.
   * Non-empty means a board was resolved (either matched or first-visit default).
   */
  boardId: string;

  /**
   * The resolved classId. Same semantics as boardId above.
   */
  classId: string;

  /**
   * True when navSelection was present but we could not find a matching board.
   * The caller should treat this as "show no content / No Resources Found".
   */
  boardMismatch: boolean;

  /**
   * True when navSelection was present but we could not find a matching class.
   * The caller should treat this as "show no content / No Resources Found".
   */
  classMismatch: boolean;
}

/**
 * Resolves the board + class IDs from the available API lists, with
 * strict validation when a navSelection cookie is present.
 *
 * Usage:
 *   const { boardId, classId, boardMismatch, classMismatch } =
 *     resolveSelectedBoardAndClass(navSelection, boards, classes);
 *   if (boardMismatch || classMismatch) return { content: null };
 */
export function resolveSelectedBoardAndClass(
  navSelection: { board: string; class: string } | null,
  boards: Board[],
  classes: ClassLevel[],
): ResolvedBoardClass {
  const boardId = resolveBoard(navSelection, boards);
  const boardMismatch = navSelection !== null && boardId === '';

  // Only resolve class once we know we have a valid board
  const classId = boardMismatch ? '' : resolveClass(navSelection, classes);
  const classMismatch =
    navSelection !== null && !boardMismatch && classId === '';

  return { boardId, classId, boardMismatch, classMismatch };
}
