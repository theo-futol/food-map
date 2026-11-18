'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/validate';
import { Close, Locate } from './icons';
import { CATEGORY_LABELS, type Place } from './types';

type Props = {
  place?: Place;
  cities: string[];
  pick: [number, number] | null;
  setPick: (p: [number, number]) => void;
  onClose: () => void;
  onSaved: (id: number) => void;
};

export default function PlaceForm({ place, cities, pick, setPick, onClose, onSaved }: Props) {
  const [name, setName] = useState(place?.name ?? '');
  const [category, setCategory] = useState<string>(place?.category ?? 'restaurant');
  const [city, setCity] = useState(place?.city ?? '');
  const [address, setAddress] = useState(place?.address ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const geocode = async () => {
    const q = [address, city].filter(Boolean).join(', ') || name;
    if (!q) return setError('Saisissez d’abord une adresse ou une ville.');
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=re&q=${encodeURIComponent(q)}`,
      );
      const [hit] = await res.json();
      if (hit) setPick([Number(hit.lat), Number(hit.lon)]);
      else setError('Adresse introuvable. Cliquez plutôt sur la carte.');
    } catch {
      setError('La recherche d’adresse a échoué. Cliquez plutôt sur la carte.');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return setError('Cliquez sur la carte pour placer l’adresse.');
    setBusy(true);
    const res = await fetch(place ? `/api/places/${place.id}` : '/api/places', {
      method: place ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, city, address, lat: pick[0], lng: pick[1] }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? 'Échec de l’enregistrement.');
    onSaved(place?.id ?? data.id);
  };

  return (
    <aside className="panel">
      <button className="close" onClick={onClose} aria-label="Fermer">
        <Close />
      </button>
      <h2>{place ? 'Modifier l’adresse' : 'Nouvelle adresse'}</h2>
      <form onSubmit={submit}>
        <label>
          Nom
          <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Catégorie
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ville
          <input required maxLength={100} list="cities" value={city} onChange={(e) => setCity(e.target.value)} />
          <datalist id="cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Adresse <span className="optional">facultatif</span>
          <input maxLength={300} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <button type="button" onClick={geocode}>
          <Locate /> Trouver sur la carte
        </button>
        <p className="hint">
          {pick
            ? `Position : ${pick[0].toFixed(5)}, ${pick[1].toFixed(5)}. Cliquez sur la carte pour la modifier.`
            : 'Cliquez sur la carte pour placer l’adresse.'}
        </p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row actions">
          <button type="button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={busy}>
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </aside>
  );
}
