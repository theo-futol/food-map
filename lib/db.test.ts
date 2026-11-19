import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

test('migrates visits into places, keeping stars, comments and photos', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'food-map-'));
  const old = new Database(path.join(dir, 'food-map.db'));
  old.exec(`
    CREATE TABLE places (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, city TEXT NOT NULL,
      address TEXT, lat REAL NOT NULL, lng REAL NOT NULL, approx_position INTEGER NOT NULL DEFAULT 0, created_at TEXT);
    CREATE TABLE visits (id INTEGER PRIMARY KEY, place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      visited_on TEXT, stars INTEGER, comment TEXT, created_at TEXT);
    CREATE TABLE photos (id INTEGER PRIMARY KEY, visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
      filename TEXT NOT NULL, created_at TEXT);
    INSERT INTO places (id, name, category, city, lat, lng) VALUES (1, 'A', 'snack', 'X', 0, 0), (2, 'B', 'hotel', 'X', 0, 0);
    INSERT INTO visits (id, place_id, stars, comment) VALUES (1, 1, 4, 'bon'), (2, 1, 5, 'top'), (3, 1, NULL, NULL);
    INSERT INTO photos (id, visit_id, filename) VALUES (7, 1, 'a.jpg'), (8, 2, 'b.jpg');
  `);
  old.close();

  process.env.DATA_DIR = dir;
  const { getDb } = await import('./db.ts');
  const db = getDb();
  assert.deepEqual(db.prepare('SELECT id, stars, comment FROM places ORDER BY id').all(), [
    { id: 1, stars: 5, comment: 'bon\n\ntop' }, // round(4.5) = 5
    { id: 2, stars: null, comment: null },
  ]);
  assert.deepEqual(db.prepare('SELECT id, place_id, filename FROM photos ORDER BY id').all(), [
    { id: 7, place_id: 1, filename: 'a.jpg' },
    { id: 8, place_id: 1, filename: 'b.jpg' },
  ]);
  assert.equal(db.prepare("SELECT count(*) FROM sqlite_master WHERE name = 'visits'").pluck().get(), 0);
  fs.rmSync(dir, { recursive: true });
});
