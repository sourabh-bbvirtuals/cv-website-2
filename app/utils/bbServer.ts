/**
 * Server-side only API client for the BB server.
 * All functions here run in Remix loaders — never in the browser.
 */

const BB_SERVER_URL =
  process.env.BB_SERVER_URL ?? 'http://localhost:3001';
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
  const data = await bbGet<{ boards: Board[] }>(
    '/student/free-resources/boards',
    token,
  );
  return data.boards;
}

export async function fetchClasses(
  token: string,
  boardId: string,
): Promise<ClassLevel[]> {
  const data = await bbGet<{ classes: ClassLevel[] }>(
    '/student/free-resources/classes',
    token,
    { boardId },
  );
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
