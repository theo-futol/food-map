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

// Shown to the user as API errors, so in French.
const FIELDS: Record<string, string> = { name: 'Le nom', category: 'La catégorie', city: 'La ville', address: 'L’adresse', lat: 'La latitude', lng: 'La longitude' };

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : null);
const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;

// partial = true for PATCH: only the keys present are checked and returned.
export function parsePlace(input: unknown, partial = false): Result<Record<string, string | number | null>> {
  if (!input || typeof input !== 'object') return { error: 'le corps doit être un objet JSON' };
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
      if (required && !partial) return { error: `${FIELDS[key]} est obligatoire` };
      continue;
    }
    const v = check(b[key]);
    if (v === null) return { error: `${FIELDS[key]} est invalide` };
    out[key] = v === undefined ? null : v;
  }
  if (partial && Object.keys(out).length === 0) return { error: 'rien à modifier' };
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
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: 'la note doit être comprise entre 1 et 5' };
  }
  let comment: string | null = null;
  if (typeof f.comment === 'string' && f.comment.trim()) {
    if (f.comment.length > 5000) return { error: 'le commentaire est trop long' };
    comment = f.comment.trim();
  }
  let visited_on: string | null = null;
  if (typeof f.visited_on === 'string' && f.visited_on) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.visited_on) || isNaN(Date.parse(f.visited_on))) return { error: 'la date de visite est invalide' };
    visited_on = f.visited_on;
  }
  return { value: { stars, comment, visited_on } };
}

export function checkPhoto(type: string, size: number): string | null {
  if (!IMAGE_TYPES[type]) return 'les photos doivent être au format JPEG, PNG, WebP ou GIF';
  if (size > MAX_PHOTO_BYTES) return 'les photos ne doivent pas dépasser 10 Mo';
  return null;
}
