import { getDb, bad, toId, removeFiles } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = toId((await params).id);
  if (!id) return bad('invalid id');
  const db = getDb();
  const files = db.prepare('SELECT filename FROM photos WHERE visit_id = ?').pluck().all(id) as string[];
  const { changes } = db.prepare('DELETE FROM visits WHERE id = ?').run(id);
  if (!changes) return bad('not found', 404);
  removeFiles(files);
  return Response.json({ ok: true });
}
