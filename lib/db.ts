import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

let ready: Promise<pg.Pool> | undefined;

async function init() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(fs.readFileSync(path.join(process.cwd(), 'db/schema.sql'), 'utf8'));
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM places');
  if (rows[0].n === 0) await pool.query(fs.readFileSync(path.join(process.cwd(), 'db/seed.sql'), 'utf8'));
  return pool;
}

// Connected lazily so `next build` never touches the DB.
function getDb() {
  ready ??= init().catch((e) => {
    ready = undefined; // retry on the next request, e.g. if Postgres was still starting
    throw e;
  });
  return ready;
}

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
  return (await getDb()).query<T & pg.QueryResultRow>(text, params);
}

export function toId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const bad = (error: string, status = 400) => Response.json({ error }, { status });
