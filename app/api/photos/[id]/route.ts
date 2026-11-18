import fs from 'node:fs/promises';
import path from 'node:path';
import { getDb, bad, toId, removeFiles, UPLOAD_DIR } from '@/lib/db';
import { IMAGE_TYPES } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

const filenameOf = (id: number) =>
  getDb().prepare('SELECT filename FROM photos WHERE id = ?').pluck().get(id) as string | undefined;

export async function GET(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  const name = id && filenameOf(id);
  if (!name) return bad('introuvable', 404);
  const type = Object.keys(IMAGE_TYPES).find((t) => name.endsWith(IMAGE_TYPES[t]))!;
  const data = await fs.readFile(path.join(UPLOAD_DIR, path.basename(name))).catch(() => null);
  if (!data) return bad('fichier manquant', 404);
  return new Response(data, {
    headers: {
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  const name = id && filenameOf(id);
  if (!name) return bad('introuvable', 404);
  getDb().prepare('DELETE FROM photos WHERE id = ?').run(id);
  removeFiles([name]);
  return Response.json({ ok: true });
}
