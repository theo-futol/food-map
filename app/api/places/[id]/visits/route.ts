import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb, bad, toId, removeFiles, UPLOAD_DIR } from '@/lib/db';
import { parseVisit, checkPhoto, IMAGE_TYPES } from '@/lib/validate';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const placeId = toId((await params).id);
  if (!placeId) return bad('invalid id');
  const form = await req.formData().catch(() => null);
  if (!form) return bad('expected multipart form data');

  const r = parseVisit({ stars: form.get('stars'), comment: form.get('comment'), visited_on: form.get('visited_on') });
  if ('error' in r) return bad(r.error);
  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files) {
    const err = checkPhoto(f.type, f.size);
    if (err) return bad(err);
  }

  const db = getDb();
  if (!db.prepare('SELECT 1 FROM places WHERE id = ?').get(placeId)) return bad('not found', 404);

  const names: string[] = [];
  try {
    for (const f of files) {
      const name = randomUUID() + IMAGE_TYPES[f.type];
      await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
      names.push(name);
    }
    const v = r.value;
    const id = db.transaction(() => {
      const visitId = db
        .prepare('INSERT INTO visits (place_id, visited_on, stars, comment) VALUES (?, ?, ?, ?)')
        .run(placeId, v.visited_on, v.stars, v.comment).lastInsertRowid;
      const ins = db.prepare('INSERT INTO photos (visit_id, filename) VALUES (?, ?)');
      for (const n of names) ins.run(visitId, n);
      return Number(visitId);
    })();
    return Response.json({ id }, { status: 201 });
  } catch (e) {
    removeFiles(names); // don't leave orphan files if the insert failed
    throw e;
  }
}
