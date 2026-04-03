import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import FreeResourcesPage, {
  type TabId,
} from '~/components/free-resources/FreeResourcesPage';

const TAB_ID_BY_SEGMENT: Record<string, TabId> = {
  'mock-tests': 'mock',
  'formula-cards': 'formula',
  'study-notes': 'notes',
  'past-papers': 'papers',
  quizzes: 'quizzes',
  'free-videos': 'videos',
};

export function loader({ params }: LoaderFunctionArgs) {
  const raw = params.tab ?? '';
  const normalized = decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-');

  const tab = TAB_ID_BY_SEGMENT[normalized];
  if (!tab) {
    throw new Response(null, { status: 404 });
  }

  return json({ tab });
}

export default function FreeResourcesTabRoute() {
  const { tab } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <FreeResourcesPage initialTab={tab} />
    </Layout>
  );
}
