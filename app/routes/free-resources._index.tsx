import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => [
  {
    title:
      'Free Commerce Resources – Mock Tests, Notes & Past Papers | Commerce Virtuals',
  },
  {
    name: 'description',
    content:
      'Download free Class 11 & 12 commerce study notes, past papers, mock tests and MCQ quizzes for CBSE and Maharashtra HSC board. No signup needed. 100% free.',
  },
];
import Layout from '~/components/Layout';
import FreeResourcesPage from '~/components/free-resources/FreeResourcesPage';
import { withGuestToken, LimitReachedError } from '~/utils/guestSession.server';
import {
  fetchBoards,
  fetchClasses,
  fetchTabNames,
  fetchTabContent,
} from '~/utils/bbServer';
import { resolveSelectedBoardAndClass } from '~/utils/resolveBoardClass.server';
import { resolveNavbarBoardSelection } from '~/utils/resolveNavbarBoard.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const subjectId = url.searchParams.get('subjectId') ?? undefined;
  const chapterNames = url.searchParams.get('chapterNames') ?? undefined;
  const page = url.searchParams.get('page') ?? '1';
  const q = url.searchParams.get('q') ?? undefined;

  // Start resolveNavbarBoardSelection immediately — it hits Vendure (GraphQL)
  // and has no dependency on the guest token. Running it in parallel with
  // withGuestToken saves ~300-500 ms on every filter or tab change.
  const navSelectionPromise = resolveNavbarBoardSelection(request);

  try {
    const result = await withGuestToken(request, async (token) => {
      // fetchBoards and navSelection now run concurrently.
      // fetchBoards is cached after the first call.
      const [boards, navSelection] = await Promise.all([
        fetchBoards(token),
        navSelectionPromise,
      ]);

      // Resolve board first (needs no classes yet)
      const { boardId: selectedBoardId, boardMismatch } =
        resolveSelectedBoardAndClass(
          navSelection,
          boards,
          [], // classes not needed for board resolution
        );

      if (!selectedBoardId || boardMismatch) {
        // Either no boards available, or user's cookie pointed to an unknown board
        return {
          tabNames: [] as string[],
          activeTab: '',
          content: null,
        };
      }

      // fetchClasses is cached after the first call per boardId
      const classes = await fetchClasses(token, selectedBoardId);
      const { classId: selectedClassId, classMismatch } =
        resolveSelectedBoardAndClass(navSelection, boards, classes);

      if (classMismatch) {
        // User's cookie specified a class that doesn't exist for this board
        return {
          tabNames: [] as string[],
          activeTab: '',
          content: null,
        };
      }

      const tabNames = selectedClassId
        ? await fetchTabNames(token, selectedBoardId, selectedClassId)
        : [];
      const activeTab = tabNames[0] ?? '';

      let content = null;
      if (activeTab) {
        content = await fetchTabContent(token, {
          boardId: selectedBoardId,
          tabName: activeTab,
          classId: selectedClassId || undefined,
          page,
          subjectId,
          chapterNames,
          q,
        });
      }

      return {
        tabNames,
        activeTab,
        content,
      };
    });

    return json(
      { ...result.data, limitReached: false },
      result.headers ? { headers: result.headers } : undefined,
    );
  } catch (err) {
    if (err instanceof LimitReachedError) {
      return json({
        tabNames: [] as string[],
        activeTab: '',
        content: null,
        limitReached: true,
      });
    }
    throw err;
  }
}

export default function FreeResourcesIndexRoute() {
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
