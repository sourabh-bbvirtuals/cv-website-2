import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

const TAB_META_INFO: Record<string, { title: string; description: string }> = {
  'mock-tests': {
    title:
      'Free Mock Tests for Class 11 & 12 – CBSE & Maharashtra HSC | Commerce Virtuals',
    description:
      'Attempt free full-length mock tests for CBSE and Maharashtra Board HSC commerce exams. Board-pattern papers with marking schemes for Accountancy, BST, Economics & more.',
  },
  quizzes: {
    title: 'Commerce MCQ Quizzes – CBSE, HSC & CUET Prep | Commerce Virtuals',
    description:
      'Practice topic-wise MCQ quizzes for Class 11 & 12 commerce — Accountancy, Business Studies, Economics and more. Ideal for CBSE boards, Maharashtra HSC and CUET-UG prep.',
  },
  'past-papers': {
    title:
      'Previous Year Question Papers – CBSE & Maharashtra HSC Commerce | Commerce Virtuals',
    description:
      'Download CBSE Class 11 & 12 and Maharashtra HSC board previous year question papers with answer keys. Free for all commerce subjects including Accountancy, OCM and Economics.',
  },
  'free-videos': {
    title:
      'Free Commerce Video Lectures – Class 11 & 12 CBSE & HSC | Commerce Virtuals',
    description:
      'Watch free concept video lectures for Class 11 & 12 commerce. Covers CBSE and Maharashtra HSC subjects — Accountancy, Business Studies, Economics, OCM, BK and more.',
  },
  'study-notes': {
    title:
      'Free Commerce Study Notes – CBSE & Maharashtra HSC | Commerce Virtuals',
    description:
      'Download free chapter-wise study notes, revision sheets and formula charts for CBSE and Maharashtra Board HSC commerce subjects. Class 11 & 12 notes — crisp, exam-ready and free.',
  },
};

export const meta: MetaFunction = ({ params }) => {
  const tab = params.tab ?? '';
  const info = TAB_META_INFO[tab];
  if (!info) {
    return [{ title: 'Free Commerce Resources | Commerce Virtuals' }];
  }
  return [
    { title: info.title },
    { name: 'description', content: info.description },
  ];
};
import Layout from '~/components/Layout';
import FreeResourcesPage from '~/components/free-resources/FreeResourcesPage';
import { withGuestToken, LimitReachedError } from '~/utils/guestSession.server';
import {
  fetchBoards,
  fetchClasses,
  fetchTabNames,
  fetchTabContent,
} from '~/utils/bbServer';
import type { Board, ClassLevel, TabContentResponse } from '~/utils/bbServer';
import { resolveSelectedBoardAndClass } from '~/utils/resolveBoardClass.server';
import { resolveNavbarBoardSelection } from '~/utils/resolveNavbarBoard.server';
import {
  freeResourcesTabSegment,
  isFreeResourcesTabContentEmpty,
  preservedFreeResourcesSearchString,
} from '~/utils/freeResourcesTabFallback.server';

type BoardWithClasses = { board: Board; classes: ClassLevel[] };

async function fetchMergedAllBoardsTabContent(
  token: string,
  tabNameForFetch: string,
  boardsWithClasses: BoardWithClasses[],
  page: string,
  opts?: {
    subjectId?: string;
    chapterNames?: string;
    q?: string;
  },
): Promise<TabContentResponse> {
  const contentPromises: Promise<TabContentResponse>[] = [];
  const { subjectId, chapterNames, q } = opts ?? {};
  for (const { board, classes } of boardsWithClasses) {
    if (classes.length === 0) {
      contentPromises.push(
        fetchTabContent(token, {
          boardId: board.id,
          tabName: tabNameForFetch,
          page,
          subjectId,
          chapterNames,
          q,
        }),
      );
    } else {
      for (const cls of classes) {
        contentPromises.push(
          fetchTabContent(token, {
            boardId: board.id,
            classId: cls.id,
            tabName: tabNameForFetch,
            page,
            subjectId,
            chapterNames,
            q,
          }),
        );
      }
    }
  }
  const contentByBoard = await Promise.all(contentPromises);
  return contentByBoard.reduce(
    (acc, boardContent: TabContentResponse) => {
      acc.subjects.push(...boardContent.subjects);
      acc.totalCount += boardContent.totalCount;
      const uniqueChapters = new Set([
        ...acc.chapterNames,
        ...boardContent.chapterNames,
      ]);
      acc.chapterNames = Array.from(uniqueChapters);
      const uniqueSubjects = new Map(
        acc.availableSubjects.map((s) => [s.id, s]),
      );
      boardContent.availableSubjects.forEach((s) => {
        uniqueSubjects.set(s.id, s);
      });
      acc.availableSubjects = Array.from(uniqueSubjects.values());
      return acc;
    },
    {
      subjects: [] as TabContentResponse['subjects'],
      totalCount: 0,
      page: parseInt(page, 10),
      pageSize: contentByBoard[0]?.pageSize || 10,
      hasNextPage: false,
      chapterNames: [] as string[],
      availableSubjects: [] as TabContentResponse['availableSubjects'],
    } satisfies Pick<
      TabContentResponse,
      | 'subjects'
      | 'totalCount'
      | 'page'
      | 'pageSize'
      | 'hasNextPage'
      | 'chapterNames'
      | 'availableSubjects'
    >,
  );
}

const TAB_NAME_BY_SEGMENT: Record<string, string> = {
  'mock-tests': 'Mock Tests',
  'study-notes': 'Study Notes',
  'past-papers': 'Past Papers',
  quizzes: 'Quizzes',
  'free-videos': 'Free Videos',
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const raw = params.tab ?? '';
  const normalized = decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-');

  const tabName = TAB_NAME_BY_SEGMENT[normalized];
  if (!tabName) {
    throw new Response(null, { status: 404 });
  }

  const url = new URL(request.url);
  const subjectId = url.searchParams.get('subjectId') ?? undefined;
  const chapterNames = url.searchParams.get('chapterNames') ?? undefined;
  const page = url.searchParams.get('page') ?? '1';
  const q = url.searchParams.get('q') ?? undefined;
  const allBoards = url.searchParams.get('allBoards') === 'true'; // Use URL param instead of cookie

  // Start resolveNavbarBoardSelection immediately — it hits Vendure (GraphQL)
  // and has no dependency on the guest token. Running it in parallel with
  // withGuestToken (which fetches + validates the token) saves ~300-500 ms.
  const navSelectionPromise = resolveNavbarBoardSelection(request);

  try {
    const result = await withGuestToken(request, async (token) => {
      // fetchBoards and navSelection are now both in flight at the same time.
      // fetchBoards is cached after the first call, so it's near-instant
      // on subsequent filter changes.
      const [boards, navSelection] = await Promise.all([
        fetchBoards(token),
        navSelectionPromise,
      ]);

      // If "All Boards" is selected, fetch content for all boards
      if (allBoards) {
        // Fetch classes for all boards to ensure we get data for all classes
        const boardsWithClasses = await Promise.all(
          boards.map(async (board) => {
            const classes = await fetchClasses(token, board.id);
            return { board, classes };
          }),
        );

        const firstBoardId = boards[0]?.id;
        const firstClassId = boardsWithClasses[0]?.classes[0]?.id;

        const [fetchedTabNames, mergedContent] = await Promise.all([
          firstBoardId
            ? fetchTabNames(token, firstBoardId, firstClassId)
            : Promise.resolve([] as string[]),
          fetchMergedAllBoardsTabContent(
            token,
            tabName,
            boardsWithClasses,
            page,
            {
              subjectId,
              chapterNames,
              q,
            },
          ),
        ]);

        const finalTabNames =
          fetchedTabNames.length > 0
            ? fetchedTabNames
            : Object.values(TAB_NAME_BY_SEGMENT);

        const mayAutoSwitchTab =
          !subjectId && !chapterNames && !q && page === '1';

        if (mayAutoSwitchTab && isFreeResourcesTabContentEmpty(mergedContent)) {
          for (const candidate of finalTabNames) {
            if (candidate === tabName) continue;
            const seg = freeResourcesTabSegment(candidate);
            if (!seg) continue;
            const probed = await fetchMergedAllBoardsTabContent(
              token,
              candidate,
              boardsWithClasses,
              '1',
            );
            if (!isFreeResourcesTabContentEmpty(probed)) {
              const qs = preservedFreeResourcesSearchString(url.searchParams);
              return {
                tabNames: finalTabNames,
                activeTab: tabName,
                content: null,
                redirectTo: `/free-resources/${seg}${qs}`,
              };
            }
          }
        }

        return {
          tabNames: finalTabNames,
          activeTab: tabName,
          content: mergedContent,
          redirectTo: null as string | null,
        };
      }

      // Resolve board first (needs no classes yet)
      const { boardId: selectedBoardId, boardMismatch } =
        resolveSelectedBoardAndClass(
          navSelection,
          boards,
          [], // classes not needed for board resolution
        );

      if (!selectedBoardId || boardMismatch) {
        return {
          tabNames: [] as string[],
          activeTab: tabName,
          content: null,
          redirectTo: null as string | null,
        };
      }

      // fetchClasses is cached after the first call per boardId
      const classes = await fetchClasses(token, selectedBoardId);
      const { classId: selectedClassId, classMismatch } =
        resolveSelectedBoardAndClass(navSelection, boards, classes);

      if (classMismatch) {
        return {
          tabNames: [] as string[],
          activeTab: tabName,
          content: null,
          redirectTo: null as string | null,
        };
      }

      // KEY OPTIMISATION: we already know the tab name from the URL segment,
      // so we don't need to wait for fetchTabNames before starting the content
      // fetch. Fire both in parallel — saves the full round-trip of tabNames
      // (typically 150–400 ms) off the critical path.
      const [tabNames, content] = await Promise.all([
        selectedClassId
          ? fetchTabNames(token, selectedBoardId, selectedClassId)
          : Promise.resolve([] as string[]),
        fetchTabContent(token, {
          boardId: selectedBoardId,
          tabName,
          classId: selectedClassId || undefined,
          page,
          subjectId,
          chapterNames,
          q,
        }),
      ]);

      const orderedTabNames =
        tabNames.length > 0
          ? tabNames
          : (Object.values(TAB_NAME_BY_SEGMENT) as string[]);

      const mayAutoSwitchTab =
        !subjectId && !chapterNames && !q && page === '1';

      if (mayAutoSwitchTab && isFreeResourcesTabContentEmpty(content)) {
        for (const candidate of orderedTabNames) {
          if (candidate === tabName) continue;
          const seg = freeResourcesTabSegment(candidate);
          if (!seg) continue;
          const probed = await fetchTabContent(token, {
            boardId: selectedBoardId,
            tabName: candidate,
            classId: selectedClassId || undefined,
            page: '1',
          });
          if (!isFreeResourcesTabContentEmpty(probed)) {
            const qs = preservedFreeResourcesSearchString(url.searchParams);
            return {
              tabNames,
              activeTab: tabName,
              content: null,
              redirectTo: `/free-resources/${seg}${qs}`,
            };
          }
        }
      }

      return {
        tabNames,
        activeTab: tabName,
        content,
        redirectTo: null as string | null,
      };
    });

    const { redirectTo, ...rest } = result.data;
    if (redirectTo) {
      return redirect(redirectTo, {
        headers: result.headers,
      });
    }

    return json(
      { ...rest, limitReached: false },
      result.headers ? { headers: result.headers } : undefined,
    );
  } catch (err) {
    if (err instanceof LimitReachedError) {
      return json({
        tabNames: [] as string[],
        activeTab: tabName,
        content: null,
        limitReached: true,
      });
    }
    throw err;
  }
}

export default function FreeResourcesTabRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <Layout>
      <FreeResourcesPage
        tabNames={data.tabNames}
        activeTab={data.activeTab}
        content={data.content}
        limitReached={data.limitReached}
      />
    </Layout>
  );
}
