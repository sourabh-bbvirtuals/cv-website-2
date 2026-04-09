import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

const TAB_META_INFO: Record<string, { title: string; description: string }> = {
  'mock-tests': {
    title: 'Free Mock Tests for Class 11 & 12 – CBSE & Maharashtra HSC | Commerce Virtuals',
    description: 'Attempt free full-length mock tests for CBSE and Maharashtra Board HSC commerce exams. Board-pattern papers with marking schemes for Accountancy, BST, Economics & more.',
  },
  quizzes: {
    title: 'Commerce MCQ Quizzes – CBSE, HSC & CUET Prep | Commerce Virtuals',
    description: 'Practice topic-wise MCQ quizzes for Class 11 & 12 commerce — Accountancy, Business Studies, Economics and more. Ideal for CBSE boards, Maharashtra HSC and CUET-UG prep.',
  },
  'past-papers': {
    title: 'Previous Year Question Papers – CBSE & Maharashtra HSC Commerce | Commerce Virtuals',
    description: 'Download CBSE Class 11 & 12 and Maharashtra HSC board previous year question papers with answer keys. Free for all commerce subjects including Accountancy, OCM and Economics.',
  },
  'free-videos': {
    title: 'Free Commerce Video Lectures – Class 11 & 12 CBSE & HSC | Commerce Virtuals',
    description: 'Watch free concept video lectures for Class 11 & 12 commerce. Covers CBSE and Maharashtra HSC subjects — Accountancy, Business Studies, Economics, OCM, BK and more.',
  },
  'study-notes': {
    title: 'Free Commerce Study Notes – CBSE & Maharashtra HSC | Commerce Virtuals',
    description: 'Download free chapter-wise study notes, revision sheets and formula charts for CBSE and Maharashtra Board HSC commerce subjects. Class 11 & 12 notes — crisp, exam-ready and free.',
  },
};

export const meta: MetaFunction = ({ params }) => {
  const tab = params.tab ?? '';
  const info = TAB_META_INFO[tab];
  if (!info) {
    return [
      { title: 'Free Commerce Resources | Commerce Virtuals' },
    ];
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
          activeTab: tabName,
          content: null,
        };
      }

      const classes = await fetchClasses(token, selectedBoardId);
      const selectedClassId = classId ?? classes[0]?.id ?? '';

      const tabNames = selectedClassId
        ? await fetchTabNames(token, selectedBoardId, selectedClassId)
        : [];

      let content = null;
      if (tabNames.includes(tabName)) {
        content = await fetchTabContent(token, {
          boardId: selectedBoardId,
          tabName,
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
        activeTab: tabName,
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
