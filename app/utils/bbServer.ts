/**
 * Server-side only API client for the BB server.
 * All functions here run in Remix loaders — never in the browser.
 */

const BB_SERVER_URL = process.env.BB_SERVER_URL ?? 'http://localhost:3001';
const GUEST_TOKEN_API_KEY = process.env.GUEST_TOKEN_API_KEY ?? '';

// ── Types ──────────────────────────────────────────────────────

export interface Board {
  id: string;
  name: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  boardIds: string[];
}

export interface SubjectCourse {
  mappingId: string;
  courseId: string;
  displayName: string;
  courseName: string;
}

export interface Subject {
  id: string;
  name: string;
  boardId: string;
  classId: string | null;
  courses: SubjectCourse[];
}

export interface CourseTab {
  id: string;
  courseId: string;
  name: string;
  order: number;
}

export interface ContentItem {
  type: 'note' | 'video' | 'live' | 'test' | 'resource' | 'subjectiveTest';
  id: string;
  courseId: string;
  name: string;
  tabId: string;
  folderId: string | null;
  order: number;
  chapterName: string | null;

  // note
  pdfUrl?: string;
  subtitle?: string;
  thumbnailUrl?: string;
  isDownloadable?: boolean;
  pageCount?: number | null;

  // video
  provider?: string;
  videoId?: string;
  duration?: string;
  watchedTime?: string;
  videoApiBaseUrl?: string;
  isLimitReached?: boolean;

  // test (MCQ)
  description?: string;
  status?: string;
  questionCount?: number;
  testStatus?: 'resume' | 'completed' | 'start';
  isTestCompleted?: boolean;
  testScore?: number | null;
  totalMarks?: number | null;
  attempt?: number;
  completedAt?: string | null;
  maxAttempts?: number;
  testDuration?: number | null;
  difficulty?: string | null;
  chapter?: string | null;

  // subjectiveTest
  totalQuestions?: number | null;
  durationMinutes?: number | null;
  questionPaperUrl?: string | null;
  answersUrl?: string | null;

  // resource
  resourceType?: string;
  url?: string;
}

export interface SubjectGroup {
  id: string;
  name: string;
  items: ContentItem[];
}

export interface TabContentResponse {
  subjects: SubjectGroup[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  chapterNames: string[];
  availableSubjects: { id: string; name: string }[];
}

export class LimitReachedError extends Error {
  constructor() {
    super('Free preview limit reached');
    this.name = 'LimitReachedError';
  }
}

export class GuestTokenInvalidError extends Error {
  constructor() {
    super('Guest token is invalid or expired');
    this.name = 'GuestTokenInvalidError';
  }
}

// ── Guest token ────────────────────────────────────────────────

export async function requestGuestToken(): Promise<string> {
  const res = await fetch(`${BB_SERVER_URL}/auth/guest-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: GUEST_TOKEN_API_KEY }),
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain guest token: ${res.status}`);
  }

  const data = await res.json();
  return data.guestToken as string;
}

// ── In-memory TTL cache ────────────────────────────────────────
// Boards and classes are static data that never change at runtime.
// Caching eliminates 2 of the 5 sequential network calls on every filter
// change. TTL of 5 minutes keeps memory bounded and data fresh enough.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

let _boardsCache: CacheEntry<Board[]> | null = null;
const _classesCache = new Map<string, CacheEntry<ClassLevel[]>>();

function getCachedBoards(): Board[] | null {
  if (!_boardsCache) return null;
  if (Date.now() > _boardsCache.expiry) {
    _boardsCache = null;
    return null;
  }
  return _boardsCache.data;
}

function setCachedBoards(boards: Board[]): void {
  _boardsCache = { data: boards, expiry: Date.now() + CACHE_TTL_MS };
}

function getCachedClasses(boardId: string): ClassLevel[] | null {
  const entry = _classesCache.get(boardId);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    _classesCache.delete(boardId);
    return null;
  }
  return entry.data;
}

function setCachedClasses(boardId: string, classes: ClassLevel[]): void {
  _classesCache.set(boardId, {
    data: classes,
    expiry: Date.now() + CACHE_TTL_MS,
  });
}

// ── Generic fetch helper ───────────────────────────────────────

async function bbGet<T>(
  path: string,
  token: string,
  params?: Record<string, string | undefined>,
): Promise<T> {
  const url = new URL(path, BB_SERVER_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.code === 'LIMIT_REACHED') throw new LimitReachedError();
    if (body.code === 'SCOPE_DENIED') throw new LimitReachedError();
  }

  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    if (body.code === 'GUEST_TOKEN_INVALID') throw new GuestTokenInvalidError();
    throw new GuestTokenInvalidError();
  }

  if (!res.ok) {
    throw new Error(`BB server error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

// ── Typed helpers ──────────────────────────────────────────────

export async function fetchBoards(token: string): Promise<Board[]> {
  const cached = getCachedBoards();
  if (cached) return cached;

  const data = await bbGet<{ boards: Board[] }>(
    '/student/free-resources/boards',
    token,
  );
  setCachedBoards(data.boards);
  return data.boards;
}

export async function fetchClasses(
  token: string,
  boardId: string,
): Promise<ClassLevel[]> {
  const cached = getCachedClasses(boardId);
  if (cached) return cached;

  const data = await bbGet<{ classes: ClassLevel[] }>(
    '/student/free-resources/classes',
    token,
    { boardId },
  );
  setCachedClasses(boardId, data.classes);
  return data.classes;
}

export async function fetchSubjects(
  token: string,
  boardId: string,
  classId?: string,
): Promise<Subject[]> {
  const data = await bbGet<{ subjects: Subject[] }>(
    '/student/free-resources/subjects',
    token,
    { boardId, classId },
  );
  return data.subjects;
}

export async function fetchTabNames(
  token: string,
  boardId: string,
  classId?: string,
): Promise<string[]> {
  const data = await bbGet<{ tabNames: string[] }>(
    '/student/free-resources/tab-names',
    token,
    { boardId, classId },
  );
  return data.tabNames;
}

export interface TabContentParams {
  boardId: string;
  tabName: string;
  classId?: string;
  page?: string;
  pageSize?: string;
  q?: string;
  subjectId?: string;
  chapterNames?: string;
}

export async function fetchTabContent(
  token: string,
  params: TabContentParams,
): Promise<TabContentResponse> {
  return bbGet<TabContentResponse>(
    '/student/free-resources/tab-content',
    token,
    params as Record<string, string | undefined>,
  );
}

// ── Test / Quiz helpers ─────────────────────────────────────────

export interface TestInfo {
  id: string;
  name: string;
  description: string;
  difficulty: string | null;
  questionCount: number;
  totalMarks: number;
  duration: number | null;
}

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string };

export interface TestQuestion {
  id: string;
  index: number;
  passage: string;
  stem: ContentBlock[];
  options: { id: string; content: ContentBlock[] }[];
  correctOptionId: string | null;
}

export async function fetchTestInfo(
  token: string,
  testId: string,
): Promise<TestInfo> {
  return bbGet<TestInfo>(`/student/free-resources/tests/${testId}/info`, token);
}

export async function fetchTestQuestions(
  token: string,
  testId: string,
): Promise<{ questions: TestQuestion[] }> {
  return bbGet<{ questions: TestQuestion[] }>(
    `/student/free-resources/tests/${testId}/questions`,
    token,
  );
}
