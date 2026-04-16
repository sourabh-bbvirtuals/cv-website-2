import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';

const BB_SERVER_URL = process.env.BB_SERVER_URL ?? 'http://localhost:3001';
const BUSINESS_VERTICAL_ID = process.env.BUSINESS_VERTICAL_ID ?? '';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return json(
      { error: 'Name, email, subject, and message are required' },
      { status: 400 },
    );
  }

  const payload: Record<string, string | undefined> = {
    name,
    email,
    phone,
    subject,
    description: message,
  };
  if (BUSINESS_VERTICAL_ID) payload.businessVerticalId = BUSINESS_VERTICAL_ID;

  const resp = await fetch(`${BB_SERVER_URL}/support-tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Failed to submit' }));
    return json(err, { status: resp.status });
  }

  const ticket = await resp.json();
  return json({ success: true, ticketId: ticket._id });
}

export function loader() {
  return redirect('/contact-us');
}
