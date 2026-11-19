import { getDb, bad } from '@/lib/db';
import { parsePlace } from '@/lib/validate';

export function GET() {
  const rows = getDb().prepare('SELECT * FROM places ORDER BY name').all();
  return Response.json(rows);
}

export async function POST(req: Request) {
  const r = parsePlace(await req.json().catch(() => null));
  if ('error' in r) return bad(r.error);
  const p = r.value;
  const { lastInsertRowid } = getDb()
    .prepare('INSERT INTO places (name, category, city, address, lat, lng, stars, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(p.name, p.category, p.city, p.address ?? null, p.lat, p.lng, p.stars ?? null, p.comment ?? null);
  return Response.json({ id: Number(lastInsertRowid) }, { status: 201 });
}
