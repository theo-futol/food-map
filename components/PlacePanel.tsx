'use client';

import { useCallback, useEffect, useState } from 'react';
import { type PlaceDetail, type Place, stars } from './types';

type Props = {
  id: number;
  onClose: () => void;
  onEdit: (p: Place) => void;
  onChanged: () => void;
};

export default function PlacePanel({ id, onClose, onEdit, onChanged }: Props) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/places/${id}`);
    if (res.ok) setPlace(await res.json());
    else setError('Could not load this place');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const del = async (url: string, what: string) => {
    if (!confirm(`Delete this ${what}?`)) return false;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) setError(`Could not delete ${what}`);
    onChanged();
    return res.ok;
  };

  const addVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    const res = await fetch(`/api/places/${id}/visits`, { method: 'POST', body: new FormData(form) });
    setBusy(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? 'Could not save visit');
    form.reset();
    load();
    onChanged();
  };

  if (!place)
    return (
      <aside className="panel">
        <button className="close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p>{error || 'Loading…'}</p>
      </aside>
    );

  const rated = place.visits.filter((v) => v.stars);
  const avg = rated.length ? rated.reduce((s, v) => s + v.stars!, 0) / rated.length : null;

  return (
    <aside className="panel">
      <button className="close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <h2>{place.name}</h2>
      <p>
        <span className={`chip chip-${place.category}`}>{place.category}</span> {place.city}
        {place.address && <> · {place.address}</>}
      </p>
      <p className="stars" aria-label={avg ? `${avg.toFixed(1)} stars` : 'not rated'}>
        {stars(avg)} {avg && avg.toFixed(1)}
      </p>
      <p className="hint">
        {place.approx_position ? 'Approximate position. ' : ''}Drag the highlighted marker to move it.
      </p>
      <div className="row">
        <button onClick={() => onEdit(place)}>Edit</button>
        <button className="danger" onClick={async () => (await del(`/api/places/${id}`, 'place')) && onClose()}>
          Delete place
        </button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      <h3>Add a visit</h3>
      <form onSubmit={addVisit}>
        <div className="row">
          <label>
            Date
            <input type="date" name="visited_on" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label>
            Stars
            <select name="stars" defaultValue="">
              <option value="">—</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Comment
          <textarea name="comment" rows={3} maxLength={5000} />
        </label>
        <label>
          Souvenir photos
          <input type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
        </label>
        <button className="primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save visit'}
        </button>
      </form>

      <h3>Visits ({place.visits.length})</h3>
      {place.visits.length === 0 && <p className="hint">No visits yet.</p>}
      {place.visits.map((v) => (
        <article key={v.id} className="visit">
          <header>
            <span>{v.visited_on ?? 'No date'}</span>
            <span className="stars">{v.stars ? stars(v.stars) : ''}</span>
            <button className="link danger" onClick={async () => (await del(`/api/visits/${v.id}`, 'visit')) && load()}>
              Delete
            </button>
          </header>
          {v.comment && <p className="comment">{v.comment}</p>}
          <div className="photos">
            {v.photos.map((pid) => (
              <figure key={pid}>
                <a href={`/api/photos/${pid}`} target="_blank" rel="noreferrer">
                  <img src={`/api/photos/${pid}`} alt={`Souvenir photo from ${place.name}`} loading="lazy" />
                </a>
                <button
                  className="link danger"
                  aria-label="Delete photo"
                  onClick={async () => (await del(`/api/photos/${pid}`, 'photo')) && load()}
                >
                  ×
                </button>
              </figure>
            ))}
          </div>
        </article>
      ))}
    </aside>
  );
}
