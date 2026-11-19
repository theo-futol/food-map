import { randomUUID } from 'node:crypto';
import { query, bad, toId } from '@/lib/db';
import { putFile, removeFiles } from '@/lib/storage';
import { checkPhoto, IMAGE_TYPES } from '@/lib/validate';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const placeId = toId((await params).id);
  if (!placeId) return bad('identifiant invalide');
  const form = await req.formData().catch(() => null);
  if (!form) return bad('formulaire multipart attendu');

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return bad('aucune photo reçue');
  for (const f of files) {
    const err = checkPhoto(f.type, f.size);
    if (err) return bad(err);
  }

  if (!(await query('SELECT 1 FROM places WHERE id = $1', [placeId])).rowCount) return bad('introuvable', 404);

  const names: string[] = [];
  try {
    for (const f of files) {
      const name = randomUUID() + IMAGE_TYPES[f.type];
      await putFile(name, f);
      names.push(name);
    }
    // one statement, so all rows go in or none do
    await query('INSERT INTO photos (place_id, filename) SELECT $1, unnest($2::text[])', [placeId, names]);
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    await removeFiles(names); // don't leave orphan files if the insert failed
    throw e;
  }
}
