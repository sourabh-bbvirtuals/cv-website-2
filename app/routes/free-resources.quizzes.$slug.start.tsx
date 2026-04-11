import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import { QuizIntroScreen } from '~/components/free-resources/quiz/QuizScreens';
import { fetchTestInfo } from '~/utils/bbServer';
import { withGuestToken } from '~/utils/guestSession.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const testId = params.slug;
  if (!testId) throw new Response(null, { status: 404 });

  const result = await withGuestToken(request, async (token) => {
    return fetchTestInfo(token, testId);
  });

  return json(
    { testInfo: result.data },
    result.headers ? { headers: result.headers } : undefined,
  );
}

export default function QuizStartRoute() {
  const { testInfo } = useLoaderData<typeof loader>();
  return (
    <Layout bare>
      <QuizIntroScreen testInfo={testInfo} />
    </Layout>
  );
}
