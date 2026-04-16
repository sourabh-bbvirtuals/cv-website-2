import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';

const BB_SERVER_URL = process.env.BB_SERVER_URL ?? 'http://localhost:3001';
const BUSINESS_VERTICAL_ID = process.env.BUSINESS_VERTICAL_ID ?? '';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { name, phone, board, courseInterest, message } = body;

  if (!name || !phone) {
    return json({ error: 'Name and phone are required' }, { status: 400 });
  }

  const payload: Record<string, string | undefined> = {
    name,
    phone,
    courseInterest: courseInterest ?? board,
    message,
    source: 'cv-website',
  };
  if (BUSINESS_VERTICAL_ID) payload.businessVerticalId = BUSINESS_VERTICAL_ID;

  const resp = await fetch(`${BB_SERVER_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Failed to submit' }));
    return json(err, { status: resp.status });
  }

  return json({ success: true });
}

export function loader() {
  return redirect('/');
}
