'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CATEGORIES, type Category } from '@/lib/validate';
import type { Place } from './types';
import Filters from './Filters';
import PlaceForm from './PlaceForm';
import PlacePanel from './PlacePanel';

const Map = dynamic(() => import('./Map'), { ssr: false });

export type Panel = { kind: 'none' } | { kind: 'view'; id: number } | { kind: 'form'; place?: Place };

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [city, setCity] = useState('');
  const [cats, setCats] = useState<Category[]>([...CATEGORIES]);
  const [panel, setPanel] = useState<Panel>({ kind: 'none' });
  const [pick, setPick] = useState<[number, number] | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const res = await fetch('/api/places');
    if (res.ok) setPlaces(await res.json());
    else setError('Could not load places');
  }, []);

  useEffect(() => {
    reload();
    const q = new URLSearchParams(location.search);
    setCity(q.get('city') ?? '');
    const c = q.get('cat')?.split(',').filter((x): x is Category => CATEGORIES.includes(x as Category));
    if (c?.length) setCats(c);
  }, [reload]);

  // Keep filters in the URL so a filtered view can be bookmarked.
  useEffect(() => {
    const q = new URLSearchParams();
    if (city) q.set('city', city);
    if (cats.length < CATEGORIES.length) q.set('cat', cats.join(','));
    history.replaceState(null, '', q.size ? `?${q}` : location.pathname);
  }, [city, cats]);

  const cities = useMemo(() => [...new Set(places.map((p) => p.city))].sort(), [places]);
  const visible = useMemo(
    () => places.filter((p) => (!city || p.city === city) && cats.includes(p.category)),
    [places, city, cats],
  );

  const move = async (id: number, lat: number, lng: number) => {
    const res = await fetch(`/api/places/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    if (!res.ok) setError('Could not move place');
    reload();
  };

  const formOpen = panel.kind === 'form';
  const selectedId = panel.kind === 'view' ? panel.id : null;

  return (
    <div className="app">
      <Filters
        cities={cities}
        city={city}
        setCity={setCity}
        cats={cats}
        setCats={setCats}
        count={visible.length}
        total={places.length}
        onAdd={() => {
          setPick(null);
          setPanel({ kind: 'form' });
        }}
      />
      {error && (
        <p className="error banner" role="alert" onClick={() => setError('')}>
          {error} (click to dismiss)
        </p>
      )}
      <main>
        <Map
          places={visible}
          selectedId={selectedId}
          onSelect={(id) => setPanel({ kind: 'view', id })}
          onMove={move}
          picking={formOpen}
          pick={pick}
          onPick={setPick}
        />
        {panel.kind === 'view' && (
          <PlacePanel
            key={panel.id}
            id={panel.id}
            onClose={() => setPanel({ kind: 'none' })}
            onEdit={(place) => {
              setPick([place.lat, place.lng]);
              setPanel({ kind: 'form', place });
            }}
            onChanged={reload}
          />
        )}
        {formOpen && (
          <PlaceForm
            key={panel.place?.id ?? 'new'}
            place={panel.place}
            cities={cities}
            pick={pick}
            setPick={setPick}
            onClose={() => setPanel(panel.place ? { kind: 'view', id: panel.place.id } : { kind: 'none' })}
            onSaved={(id) => {
              reload();
              setPanel({ kind: 'view', id });
            }}
          />
        )}
      </main>
    </div>
  );
}
