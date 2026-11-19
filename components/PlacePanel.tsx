'use client';

import { useCallback, useEffect, useState } from 'react';
import { Close, Play, Plus } from './icons';
import Slideshow from './Slideshow';
import Stars from './Stars';
import { CATEGORY_LABELS, type PlaceDetail, type Place } from './types';

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
  const [show, setShow] = useState<{ start: number; autoplay: boolean } | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/places/${id}`);
    if (res.ok) setPlace(await res.json());
    else setError('Impossible de charger cette adresse.');
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // what: "cette adresse", "cette photo"… reads naturally in both messages.
  const del = async (url: string, what: string) => {
    if (!confirm(`Supprimer ${what} ?`)) return false;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) setError(`Impossible de supprimer ${what}.`);
    onChanged();
    return res.ok;
  };

  const save = async (fields: Partial<Place>, what: string) => {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/places/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    setBusy(false);
    if (!res.ok) return setError(`Impossible d’enregistrer ${what}.`);
    setPlace((p) => p && { ...p, ...fields });
    onChanged();
    return true;
  };

  const rate = (stars: number | null) => save({ stars }, 'la note');

  const saveComment = async () => {
    const comment = draft?.trim() || null;
    if (await save({ comment }, 'le commentaire')) setDraft(null);
  };

  const deleteComment = () => confirm('Supprimer le commentaire ?') && save({ comment: null }, 'le commentaire');

  const addPhotos = async (input: HTMLInputElement) => {
    if (!input.files?.length) return;
    const body = new FormData();
    for (const f of input.files) body.append('photos', f);
    setBusy(true);
    setError('');
    const res = await fetch(`/api/places/${id}/photos`, { method: 'POST', body });
    setBusy(false);
    input.value = '';
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? 'Impossible d’ajouter les photos.');
    load();
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
      <div className="score">
        <Stars value={place.stars} onChange={rate} disabled={busy} />
        {!place.stars && <span className="hint">Touchez une étoile pour noter</span>}
      </div>
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

      <div className="section-head">
        <h3>Commentaire</h3>
        {place.comment && draft === null && (
          <div className="row">
            <button onClick={() => setDraft(place.comment)}>Modifier</button>
            <button className="danger" disabled={busy} onClick={deleteComment}>
              Supprimer
            </button>
          </div>
        )}
      </div>
      {draft !== null ? (
        <div className="comment-edit">
          <textarea
            rows={4}
            maxLength={5000}
            autoFocus
            aria-label="Commentaire"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="row">
            <button onClick={() => setDraft(null)}>Annuler</button>
            <button className="primary" disabled={busy} onClick={saveComment}>
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      ) : place.comment ? (
        <p className="comment">{place.comment}</p>
      ) : (
        <button className="comment-add" onClick={() => setDraft('')}>
          <Plus /> Ajouter un commentaire
        </button>
      )}

      <div className="section-head">
        <h3>
          Souvenirs <span className="num">{place.photos.length}</span>
        </h3>
        {place.photos.length > 0 && (
          <button onClick={() => setShow({ start: 0, autoplay: true })}>
            <Play /> Diaporama
          </button>
        )}
      </div>
      <div className="photos">
        {place.photos.map((pid) => (
          <figure key={pid}>
            <button className="photo-open" onClick={() => setShow({ start: place.photos.indexOf(pid), autoplay: false })}>
              <img src={`/api/photos/${pid}`} alt={`Agrandir la photo souvenir de ${place.name}`} loading="lazy" />
            </button>
            <button
              className="photo-del"
              aria-label="Supprimer la photo"
              onClick={async () => (await del(`/api/photos/${pid}`, 'cette photo')) && load()}
            >
              <Close />
            </button>
          </figure>
        ))}
        <label className="photo-add" aria-busy={busy}>
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={busy}
            onChange={(e) => addPhotos(e.currentTarget)}
          />
          <Plus />
          <span>{busy ? 'Envoi…' : 'Ajouter'}</span>
        </label>
      </div>
      {show && (
        <Slideshow
          photos={place.photos}
          start={show.start}
          autoplay={show.autoplay}
          title={place.name}
          onClose={() => setShow(null)}
        />
      )}
    </aside>
  );
}
