import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Layout from '~/components/Layout';
import {
  getQuizSession,
  isValidQuizSlug,
} from '~/components/free-resources/quiz/quizData';
import { QuizIntroScreen } from '~/components/free-resources/quiz/QuizScreens';

export function loader({ params }: LoaderFunctionArgs) {
  const slug = params.slug;
  if (!slug || !isValidQuizSlug(slug)) {
    throw new Response(null, { status: 404 });
  }
  return json({ session: getQuizSession(slug) });
}

export default function QuizStartRoute() {
  const { session } = useLoaderData<typeof loader>();
  return (
    <Layout bare>
      <QuizIntroScreen session={session} />
    </Layout>
  );
}
