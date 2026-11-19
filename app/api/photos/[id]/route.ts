import { query, bad, toId } from '@/lib/db';
import { getFile, removeFiles } from '@/lib/storage';
import { IMAGE_TYPES } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

const filenameOf = async (id: number) =>
  (await query<{ filename: string }>('SELECT filename FROM photos WHERE id = $1', [id])).rows[0]?.filename;

export async function GET(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  const name = id && (await filenameOf(id));
  if (!name) return bad('introuvable', 404);
  const type = Object.keys(IMAGE_TYPES).find((t) => name.endsWith(IMAGE_TYPES[t]))!;
  const data = await getFile(name);
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
  const name = id && (await filenameOf(id));
  if (!name) return bad('introuvable', 404);
  await query('DELETE FROM photos WHERE id = $1', [id]);
  await removeFiles([name]);
  return Response.json({ ok: true });
}
