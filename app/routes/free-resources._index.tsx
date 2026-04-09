import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => [
  { title: 'Free Commerce Resources – Mock Tests, Notes & Past Papers | Commerce Virtuals' },
  { name: 'description', content: 'Download free Class 11 & 12 commerce study notes, past papers, mock tests and MCQ quizzes for CBSE and Maharashtra HSC board. No signup needed. 100% free.' },
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

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const boardId = url.searchParams.get('boardId') ?? undefined;
  const classId = url.searchParams.get('classId') ?? undefined;
  const subjectId = url.searchParams.get('subjectId') ?? undefined;
  const chapterNames = url.searchParams.get('chapterNames') ?? undefined;
  const page = url.searchParams.get('page') ?? '1';
  const q = url.searchParams.get('q') ?? undefined;

  try {
    const result = await withGuestToken(request, async (token) => {
      const boards = await fetchBoards(token);
      const selectedBoardId = boardId ?? boards[0]?.id;

      if (!selectedBoardId) {
        return {
          boards,
          classes: [],
          selectedBoardId: '',
          selectedClassId: '',
          tabNames: [] as string[],
          activeTab: '',
          content: null,
        };
      }

      const classes = await fetchClasses(token, selectedBoardId);
      const selectedClassId = classId ?? classes[0]?.id ?? '';

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
        boards,
        classes,
        selectedBoardId,
        selectedClassId,
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
        boards: [],
        classes: [],
        selectedBoardId: '',
        selectedClassId: '',
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
        boards={data.boards}
        classes={data.classes}
        selectedBoardId={data.selectedBoardId}
        selectedClassId={data.selectedClassId}
        tabNames={data.tabNames}
        activeTab={data.activeTab}
        content={data.content}
        limitReached={data.limitReached}
      />
    </Layout>
  );
}
