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

export const stars = (n: number | null) => (n == null ? '—' : '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)));
