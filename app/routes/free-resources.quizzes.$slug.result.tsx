import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import { QuizResultScreen } from '~/components/free-resources/quiz/QuizScreens';
import { fetchTestInfo, fetchTestQuestions } from '~/utils/bbServer';
import { withGuestToken } from '~/utils/guestSession.server';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const testId = params.slug;
  if (!testId) throw new Response(null, { status: 404 });

  const result = await withGuestToken(request, async (token) => {
    const [info, questionsRes] = await Promise.all([
      fetchTestInfo(token, testId),
      fetchTestQuestions(token, testId),
    ]);
    return { testInfo: info, questions: questionsRes.questions };
  });

  return json(
    result.data,
    result.headers ? { headers: result.headers } : undefined,
  );
}

export default function QuizResultRoute() {
  const { testInfo, questions } = useLoaderData<typeof loader>();
  return (
    <Layout bare>
      <QuizResultScreen testInfo={testInfo} questions={questions} />
    </Layout>
  );
}
