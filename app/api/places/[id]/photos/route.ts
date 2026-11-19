import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb, bad, toId, removeFiles, UPLOAD_DIR } from '@/lib/db';
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

  const db = getDb();
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(placeId)) return bad('introuvable', 404);

  const names: string[] = [];
  try {
    for (const f of files) {
      const name = randomUUID() + IMAGE_TYPES[f.type];
      await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
      names.push(name);
    }
    const ins = db.prepare('INSERT INTO photos (place_id, filename) VALUES (?, ?)');
    db.transaction(() => names.forEach((n) => ins.run(placeId, n)))();
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    removeFiles(names); // don't leave orphan files if the insert failed
    throw e;
  }
}
