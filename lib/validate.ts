export const CATEGORIES = ['restaurant', 'snack', 'hotel'] as const;
export type Category = (typeof CATEGORIES)[number];

export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

type Result<T> = { value: T } | { error: string };

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null);
const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;

// partial = true for PATCH: only the keys present are checked and returned.
export function parsePlace(input: unknown, partial = false): Result<Record<string, string | number | null>> {
  if (!input || typeof input !== 'object') return { error: 'body must be a JSON object' };
  const b = input as Record<string, unknown>;
  const out: Record<string, string | number | null> = {};
  const rules: [string, (v: unknown) => string | number | null | undefined, boolean][] = [
    ['name', (v) => str(v, 200), true],
    ['category', (v) => (CATEGORIES.includes(v as Category) ? (v as string) : null), true],
    ['city', (v) => str(v, 100), true],
    ['address', (v) => (v == null || v === '' ? undefined : str(v, 300)), false],
    ['lat', (v) => num(v, -90, 90), true],
    ['lng', (v) => num(v, -180, 180), true],
  ];
  for (const [key, check, required] of rules) {
    if (!(key in b)) {
      if (required && !partial) return { error: `${key} is required` };
      continue;
    }
    const v = check(b[key]);
    if (v === null) return { error: `${key} is invalid` };
    out[key] = v === undefined ? null : v;
  }
  if (partial && Object.keys(out).length === 0) return { error: 'nothing to update' };
  return { value: out };
}

export function parseVisit(f: { stars?: unknown; comment?: unknown; visited_on?: unknown }): Result<{
  stars: number | null;
  comment: string | null;
  visited_on: string | null;
}> {
  let stars: number | null = null;
  if (f.stars != null && f.stars !== '') {
    stars = Number(f.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: 'stars must be 1 to 5' };
  }
  let comment: string | null = null;
  if (typeof f.comment === 'string' && f.comment.trim()) {
    if (f.comment.length > 5000) return { error: 'comment is too long' };
    comment = f.comment.trim();
  }
  let visited_on: string | null = null;
  if (typeof f.visited_on === 'string' && f.visited_on) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.visited_on) || isNaN(Date.parse(f.visited_on))) return { error: 'visited_on is invalid' };
    visited_on = f.visited_on;
  }
  return { value: { stars, comment, visited_on } };
}

export function checkPhoto(type: string, size: number): string | null {
  if (!IMAGE_TYPES[type]) return 'photos must be JPEG, PNG, WebP or GIF';
  if (size > MAX_PHOTO_BYTES) return 'photos must be 10 MB or less';
  return null;
}
