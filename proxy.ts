import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, isAuthed } from '@/lib/auth';

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/login' || isAuthed(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return Response.json({ error: 'Non connecté.' }, { status: 401 });
}

export const config = { matcher: '/api/:path*' };
