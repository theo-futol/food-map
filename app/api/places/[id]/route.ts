import { query, bad, toId } from '@/lib/db';
import { removeFiles } from '@/lib/storage';
import { parsePlace } from '@/lib/validate';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const { rows: [place] } = await query('SELECT * FROM places WHERE id = $1', [id]);
  if (!place) return bad('introuvable', 404);
  const { rows } = await query<{ id: number }>('SELECT id FROM photos WHERE place_id = $1 ORDER BY id', [id]);
  return Response.json({ ...place, photos: rows.map((r) => r.id) });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const r = parsePlace(await req.json().catch(() => null), true);
  if ('error' in r) return bad(r.error);
  const fields = r.value;
  // keys come from parsePlace's fixed list, so interpolating them is safe
  const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 2}`);
  if ('lat' in fields || 'lng' in fields) sets.push('approx_position = 0');
  const { rowCount } = await query(`UPDATE places SET ${sets.join(', ')} WHERE id = $1`, [id, ...Object.values(fields)]);
  return rowCount ? Response.json({ ok: true }) : bad('introuvable', 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = toId((await params).id);
  if (!id) return bad('identifiant invalide');
  const { rows } = await query<{ filename: string }>('SELECT filename FROM photos WHERE place_id = $1', [id]);
  const { rowCount } = await query('DELETE FROM places WHERE id = $1', [id]);
  if (!rowCount) return bad('introuvable', 404);
  await removeFiles(rows.map((r) => r.filename));
  return Response.json({ ok: true });
}
