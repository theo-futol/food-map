import { createHash, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'auth';

const hash = (s: string) => createHash('sha256').update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));

// The cookie holds a hash of the password, so changing APP_PASSWORD logs everyone out.
export const token = () => hash(`moumoune:${process.env.APP_PASSWORD}`).toString('hex');
// No APP_PASSWORD set = nobody gets in (fail closed).
export const isPassword = (p: unknown) => !!process.env.APP_PASSWORD && typeof p === 'string' && same(p, process.env.APP_PASSWORD);
export const isAuthed = (cookie?: string) => !!process.env.APP_PASSWORD && !!cookie && same(cookie, token());
