import { getDb, bad } from '@/lib/db';
import { parsePlace } from '@/lib/validate';

export function GET() {
  const rows = getDb()
    .prepare(
      `SELECT p.*, round(avg(v.stars), 1) AS avg_stars, count(v.id) AS visit_count
       FROM places p LEFT JOIN visits v ON v.place_id = p.id
       GROUP BY p.id ORDER BY p.name`,
    )
    .all();
  return Response.json(rows);
}

export async function POST(req: Request) {
  const r = parsePlace(await req.json().catch(() => null));
  if ('error' in r) return bad(r.error);
  const p = r.value;
  const { lastInsertRowid } = getDb()
    .prepare('INSERT INTO places (name, category, city, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?)')
    .run(p.name, p.category, p.city, p.address ?? null, p.lat, p.lng);
  return Response.json({ id: Number(lastInsertRowid) }, { status: 201 });
}
