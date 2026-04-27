import type { TabContentResponse } from '~/utils/bbServer';

/** Display names returned by BB tab-names API → URL segment under /free-resources/ */
export const FREE_RESOURCES_TAB_DISPLAY_TO_SEGMENT: Record<string, string> = {
  'Mock Tests': 'mock-tests',
  'Study Notes': 'study-notes',
  'Past Papers': 'past-papers',
  Quizzes: 'quizzes',
  'Free Videos': 'free-videos',
};

export function isFreeResourcesTabContentEmpty(
  content: TabContentResponse | null,
): boolean {
  if (!content) return true;
  if (content.subjects.some((g) => g.items.length > 0)) return false;
  if (content.totalCount > 0) return false;
  return true;
}

export function freeResourcesTabSegment(displayName: string): string | null {
  return FREE_RESOURCES_TAB_DISPLAY_TO_SEGMENT[displayName] ?? null;
}

/** Keep only params that still make sense after switching tabs. */
export function preservedFreeResourcesSearchString(
  source: URLSearchParams,
): string {
  const next = new URLSearchParams();
  if (source.get('allBoards') === 'true') next.set('allBoards', 'true');
  const qs = next.toString();
  return qs ? `?${qs}` : '';
}
