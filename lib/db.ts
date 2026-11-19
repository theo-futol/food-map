import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('restaurant','snack','hotel')),
  city TEXT NOT NULL,
  address TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  approx_position INTEGER NOT NULL DEFAULT 0,
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// Older DBs kept stars, comments and photos on visits; fold them into the place, keeping every photo.
function migrate(db: Database.Database) {
  const cols = db.prepare("SELECT name FROM pragma_table_info('places')").pluck().all() as string[];
  if (!cols.includes('stars'))
    db.exec(`ALTER TABLE places ADD COLUMN stars INTEGER CHECK (stars BETWEEN 1 AND 5);
             ALTER TABLE places ADD COLUMN comment TEXT;`);
  if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'visits'").get()) return;
  db.transaction(() =>
    db.exec(`
      UPDATE places SET
        stars = coalesce(stars, (SELECT CAST(round(avg(stars)) AS INTEGER) FROM visits WHERE place_id = places.id)),
        comment = coalesce(comment, (SELECT group_concat(comment, char(10) || char(10)) FROM visits
                                     WHERE place_id = places.id AND comment IS NOT NULL));
      CREATE TABLE photos_new (
        id INTEGER PRIMARY KEY,
        place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO photos_new (id, place_id, filename, created_at)
        SELECT ph.id, v.place_id, ph.filename, coalesce(ph.created_at, datetime('now')) FROM photos ph JOIN visits v ON v.id = ph.visit_id;
      DROP TABLE photos;
      ALTER TABLE photos_new RENAME TO photos;
      DROP TABLE visits;
    `),
  )();
}

let db: Database.Database | undefined;

// Opened lazily so `next build` never touches the DB.
export function getDb() {
  if (db) return db;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, 'food-map.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  migrate(db);
  const { n } = db.prepare('SELECT count(*) AS n FROM places').get() as { n: number };
  if (n === 0) db.exec(fs.readFileSync(path.join(process.cwd(), 'db/seed.sql'), 'utf8'));
  return db;
}

export function removeFiles(filenames: string[]) {
  for (const f of filenames) fs.rmSync(path.join(UPLOAD_DIR, path.basename(f)), { force: true });
}

export function toId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const bad = (error: string, status = 400) => Response.json({ error }, { status });
