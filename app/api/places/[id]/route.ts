import { getDb, bad, toId, removeFiles } from '@/lib/db';
import { parsePlace } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('invalid id');
  const db = getDb();
  const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
  if (!place) return bad('not found', 404);
  const visits = db
    .prepare('SELECT * FROM visits WHERE place_id = ? ORDER BY visited_on DESC, created_at DESC')
    .all(id) as { id: number }[];
  const photos = db
    .prepare('SELECT ph.id, ph.visit_id FROM photos ph JOIN visits v ON v.id = ph.visit_id WHERE v.place_id = ?')
    .all(id) as { id: number; visit_id: number }[];
  return Response.json({
    ...place,
    visits: visits.map((v) => ({ ...v, photos: photos.filter((p) => p.visit_id === v.id).map((p) => p.id) })),
  });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('invalid id');
  const r = parsePlace(await req.json().catch(() => null), true);
  if ('error' in r) return bad(r.error);
  const fields = r.value;
  // keys come from parsePlace's fixed list, so interpolating them is safe
  const sets = Object.keys(fields).map((k) => `${k} = @${k}`);
  if ('lat' in fields || 'lng' in fields) sets.push('approx_position = 0');
  const { changes } = getDb()
    .prepare(`UPDATE places SET ${sets.join(', ')} WHERE id = @id`)
    .run({ ...fields, id });
  return changes ? Response.json({ ok: true }) : bad('not found', 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('invalid id');
  const db = getDb();
  const files = db
    .prepare('SELECT ph.filename FROM photos ph JOIN visits v ON v.id = ph.visit_id WHERE v.place_id = ?')
    .pluck()
    .all(id) as string[];
  const { changes } = db.prepare('DELETE FROM places WHERE id = ?').run(id);
  if (!changes) return bad('not found', 404);
  removeFiles(files);
  return Response.json({ ok: true });
}
