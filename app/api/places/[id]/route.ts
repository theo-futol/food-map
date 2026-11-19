import { getDb, bad, toId, removeFiles } from '@/lib/db';
import { parsePlace } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const db = getDb();
  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
  if (!place) return bad('introuvable', 404);
  const photos = db.prepare('SELECT id FROM photos WHERE place_id = ? ORDER BY id').pluck().all(id);
  return Response.json({ ...place, photos });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const r = parsePlace(await req.json().catch(() => null), true);
  if ('error' in r) return bad(r.error);
  const fields = r.value;
  // keys come from parsePlace's fixed list, so interpolating them is safe
  const sets = Object.keys(fields).map((k) => `${k} = @${k}`);
  if ('lat' in fields || 'lng' in fields) sets.push('approx_position = 0');
  const { changes } = getDb()
    .prepare(`UPDATE places SET ${sets.join(', ')} WHERE id = @id`)
    .run({ ...fields, id });
  return changes ? Response.json({ ok: true }) : bad('introuvable', 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const db = getDb();
  const files = db
    .prepare('SELECT filename FROM photos WHERE place_id = ?')
    .pluck()
    .all(id) as string[];
  const { changes } = db.prepare('DELETE FROM places WHERE id = ?').run(id);
  if (!changes) return bad('introuvable', 404);
  removeFiles(files);
  return Response.json({ ok: true });
}
