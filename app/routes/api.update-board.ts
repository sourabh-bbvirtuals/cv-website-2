import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { updateCustomer } from '~/providers/account/account';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { board, studentClass } = (await request.json()) as {
      board?: string;
      studentClass?: string;
    };

    if (!board) {
      return json({ error: 'Board is required' }, { status: 400 });
    }

    const input: Record<string, any> = {
      customFields: { board, studentClass: studentClass || null },
    };

    await updateCustomer(input, { request });

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `bb-user-board=${encodeURIComponent(board)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    );
    if (studentClass) {
      headers.append(
        'Set-Cookie',
        `bb-user-class=${encodeURIComponent(studentClass.replace(/\D/g, ''))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
      );
    }

    return json({ ok: true }, { headers });
  } catch {
    return json({ ok: true });
  }
}
