import fs from 'node:fs/promises';
import path from 'node:path';

// Supabase Storage when configured (Vercel has no persistent disk), a local folder otherwise (Docker, dev).
const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
// Keep only the origin: the dashboard shows the API URL with /rest/v1 appended, which would break the storage paths.
const SUPABASE_URL = process.env.SUPABASE_URL && new URL(process.env.SUPABASE_URL).origin;
const BUCKET = 'photos';
const UPLOAD_DIR = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), 'data'), 'uploads');

const local = (name: string) => path.join(UPLOAD_DIR, path.basename(name));
const api = (p: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/storage/v1/object/${p}`, {
    ...init,
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, ...init.headers },
  });

export async function putFile(name: string, data: Blob) {
  if (!SUPABASE_URL) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    return fs.writeFile(local(name), Buffer.from(await data.arrayBuffer()));
  }
  const res = await api(`${BUCKET}/${name}`, { method: 'POST', headers: { 'Content-Type': data.type }, body: data });
  if (!res.ok) throw new Error(`storage upload failed: ${res.status} ${await res.text()}`);
}

export async function getFile(name: string) {
  if (!SUPABASE_URL) return fs.readFile(local(name)).catch(() => null);
  const res = await api(`${BUCKET}/${encodeURIComponent(path.basename(name))}`);
  return res.ok ? res.arrayBuffer() : null;
}

// Best effort: a leftover file only wastes space, it never breaks the app.
export async function removeFiles(names: string[]) {
  if (!names.length) return;
  if (!SUPABASE_URL) return void (await Promise.all(names.map((n) => fs.rm(local(n), { force: true }))));
  await api(BUCKET, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: names }),
  }).catch(() => {});
}
