'use client';

import { useEffect, useRef, useState } from 'react';
import { Close, Next, Pause, Play, Prev } from './icons';

type Props = {
  photos: number[];
  start: number;
  autoplay: boolean;
  title: string;
  onClose: () => void;
};

const DELAY = 3500;

export default function Slideshow({ photos, start, autoplay, title, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const [i, setI] = useState(start);
  const [playing, setPlaying] = useState(autoplay && photos.length > 1);
  const n = photos.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  // showModal gives the focus trap, Escape and the backdrop for free.
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(t);
  }, [playing, i]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <dialog
      ref={ref}
      className="slideshow"
      aria-label={`Souvenirs de ${title}`}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <header>
        <span className="num">
          {i + 1} / {n}
        </span>
        <span className="slideshow-title">{title}</span>
        <button className="icon" onClick={() => ref.current?.close()} aria-label="Fermer">
          <Close />
        </button>
      </header>
      <img key={photos[i]} src={`/api/photos/${photos[i]}`} alt={`Photo souvenir ${i + 1} sur ${n}`} />
      {n > 1 && (
        <footer>
          <button className="icon" onClick={() => go(-1)} aria-label="Photo précédente">
            <Prev />
          </button>
          <button className="icon" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Lecture'}>
            {playing ? <Pause /> : <Play />}
          </button>
          <button className="icon" onClick={() => go(1)} aria-label="Photo suivante">
            <Next />
          </button>
        </footer>
      )}
      {playing && <span key={i} className="slideshow-progress" style={{ animationDuration: `${DELAY}ms` }} />}
    </dialog>
  );
}
