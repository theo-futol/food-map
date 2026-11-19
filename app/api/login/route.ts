import { cookies } from 'next/headers';
import { COOKIE, isAuthed, isPassword, token } from '@/lib/auth';

export async function GET() {
  return new Response(null, { status: isAuthed((await cookies()).get(COOKIE)?.value) ? 204 : 401 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!isPassword(body?.password)) return Response.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
  (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return new Response(null, { status: 204 });
}
