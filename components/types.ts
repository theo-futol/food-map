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
  stars: number | null;
  comment: string | null;
};

export type PlaceDetail = Place & { photos: number[] };

export const CATEGORY_LABELS: Record<Category, string> = { restaurant: 'Restaurant', snack: 'Snack', hotel: 'Hôtel' };
