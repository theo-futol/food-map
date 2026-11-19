import { query, bad } from '@/lib/db';
import { parsePlace } from '@/lib/validate';

export async function GET() {
  const { rows } = await query('SELECT * FROM places ORDER BY name');
  return Response.json(rows);
}

export async function POST(req: Request) {
  const r = parsePlace(await req.json().catch(() => null));
  if ('error' in r) return bad(r.error);
  const p = r.value;
  const { rows } = await query<{ id: number }>(
    'INSERT INTO places (name, category, city, address, lat, lng, stars, comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
    [p.name, p.category, p.city, p.address ?? null, p.lat, p.lng, p.stars ?? null, p.comment ?? null],
  );
  return Response.json({ id: rows[0].id }, { status: 201 });
}
