'use client';

import { useCallback, useEffect, useState } from 'react';
import { Close } from './icons';
import { CATEGORY_LABELS, type PlaceDetail, type Place, frDate, stars } from './types';

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
  const [files, setFiles] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch(`/api/places/${id}`);
    if (res.ok) setPlace(await res.json());
    else setError('Impossible de charger cette adresse.');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // what: "cette adresse", "cette visite"… reads naturally in both messages.
  const del = async (url: string, what: string) => {
    if (!confirm(`Supprimer ${what} ?`)) return false;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) setError(`Impossible de supprimer ${what}.`);
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
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? 'Impossible d’enregistrer la visite.');
    form.reset();
    setFiles(0);
    load();
    onChanged();
  };

  const closeBtn = (
    <button className="close" onClick={onClose} aria-label="Fermer">
      <Close />
    </button>
  );

  if (!place)
    return (
      <aside className="panel">
        {closeBtn}
        <p className="hint">{error || 'Chargement…'}</p>
      </aside>
    );

  const rated = place.visits.filter((v) => v.stars);
  const avg = rated.length ? rated.reduce((s, v) => s + v.stars!, 0) / rated.length : null;

  return (
    <aside className="panel">
      {closeBtn}
      <p className="meta">
        <span className={`tag cat-${place.category}`}>{CATEGORY_LABELS[place.category]}</span>
        <span>
          {place.city}
          {place.address && <> · {place.address}</>}
        </span>
      </p>
      <h2>{place.name}</h2>
      <p className="score" aria-label={avg ? `${avg.toFixed(1).replace('.', ',')} sur 5` : 'Pas encore noté'}>
        {avg ? (
          <>
            <span className="stars">{stars(avg)}</span> <span className="num">{avg.toFixed(1).replace('.', ',')}</span>
          </>
        ) : (
          <span className="hint">Pas encore noté</span>
        )}
      </p>
      <p className="hint">
        {place.approx_position ? 'Position approximative. ' : ''}Faites glisser le repère en surbrillance pour le déplacer.
      </p>
      <div className="row">
        <button onClick={() => onEdit(place)}>Modifier</button>
        <button className="danger" onClick={async () => (await del(`/api/places/${id}`, 'cette adresse')) && onClose()}>
          Supprimer l’adresse
        </button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="sheet">
        <h3>Nouvelle visite</h3>
        <form onSubmit={addVisit}>
          <div className="row">
            <label>
              Date
              <input type="date" name="visited_on" defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label>
              Note
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
            Commentaire
            <textarea name="comment" rows={3} maxLength={5000} />
          </label>
          {/* Native file input text follows the browser locale, so it is hidden behind a French label. */}
          <label>
            Photos souvenirs
            <span className="file">
              <input
                type="file"
                name="photos"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => setFiles(e.target.files?.length ?? 0)}
              />
              <span className="file-btn">Choisir des photos</span>
              <span>{files ? `${files} photo${files > 1 ? 's' : ''} sélectionnée${files > 1 ? 's' : ''}` : 'Aucune photo'}</span>
            </span>
          </label>
          <button className="primary" disabled={busy}>
            {busy ? 'Enregistrement…' : 'Enregistrer la visite'}
          </button>
        </form>
      </section>

      <h3>
        Visites <span className="num">{place.visits.length}</span>
      </h3>
      {place.visits.length === 0 && <p className="hint">Aucune visite pour l’instant.</p>}
      {place.visits.map((v) => (
        <article key={v.id} className="visit">
          <header>
            <time dateTime={v.visited_on ?? undefined}>{v.visited_on ? frDate(v.visited_on) : 'Sans date'}</time>
            {v.stars && <span className="stars">{stars(v.stars)}</span>}
            <button className="link danger" onClick={async () => (await del(`/api/visits/${v.id}`, 'cette visite')) && load()}>
              Supprimer
            </button>
          </header>
          {v.comment && <p className="comment">{v.comment}</p>}
          {v.photos.length > 0 && (
            <div className="photos">
              {v.photos.map((pid) => (
                <figure key={pid}>
                  <a href={`/api/photos/${pid}`} target="_blank" rel="noreferrer">
                    <img src={`/api/photos/${pid}`} alt={`Photo souvenir de ${place.name}`} loading="lazy" />
                  </a>
                  <button
                    className="photo-del"
                    aria-label="Supprimer la photo"
                    onClick={async () => (await del(`/api/photos/${pid}`, 'cette photo')) && load()}
                  >
                    <Close />
                  </button>
                </figure>
              ))}
            </div>
          )}
        </article>
      ))}
    </aside>
  );
}
