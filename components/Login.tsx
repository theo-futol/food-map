'use client';

import { useEffect, useState } from 'react';
import App from './App';

export default function Login() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/login').then((res) => setAuthed(res.ok), () => setAuthed(false));
  }, []);

  if (authed) return <App />;
  if (authed === null) return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: new FormData(e.currentTarget).get('password') }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) setAuthed(true);
    else setError(res?.status === 401 ? 'Mot de passe incorrect.' : 'Connexion impossible, réessaie.');
  };

  return (
    <main className="login">
      <form onSubmit={submit}>
        <div className="brand">
          <h1>
            Moumoune<em>Food</em>
          </h1>
        </div>
        <p>Notre carnet d’adresses gourmandes. Entre le mot de passe pour l’ouvrir.</p>
        <label htmlFor="password" className="sr-only">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" placeholder="Mot de passe" autoComplete="current-password" autoFocus required />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? 'Ouverture…' : 'Ouvrir le carnet'}
        </button>
      </form>
    </main>
  );
}
