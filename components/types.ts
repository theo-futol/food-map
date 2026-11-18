import type { Category } from '@/lib/validate';

export type Place = {
  id: number;
  name: string;
  category: Category;
  city: string;
  address: string | null;
  lat: number;
  lng: number;
  approx_position: number;
  avg_stars: number | null;
  visit_count: number;
};

export type Visit = {
  id: number;
  visited_on: string | null;
  stars: number | null;
  comment: string | null;
  photos: number[];
};

export type PlaceDetail = Place & { visits: Visit[] };

export const CATEGORY_LABELS: Record<Category, string> = { restaurant: 'Restaurant', snack: 'Snack', hotel: 'Hôtel' };

// visited_on is a bare YYYY-MM-DD, parsed as UTC, so format in UTC to keep the same day.
export const frDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const visits = (n: number) => (n ? `${n} visite${n > 1 ? 's' : ''}` : 'Pas encore de visite');

export const stars =(n: number | null) => (n == null ? '—' : '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)));
