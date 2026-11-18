import { CATEGORIES, type Category } from '@/lib/validate';
import { CategoryIcon, Plus } from './icons';
import { CATEGORY_LABELS } from './types';

type Props = {
  cities: string[];
  city: string;
  setCity: (c: string) => void;
  cats: Category[];
  setCats: (c: Category[]) => void;
  count: number;
  total: number;
  onAdd: () => void;
};

export default function Filters({ cities, city, setCity, cats, setCats, count, total, onAdd }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <h1>
          Moumoune<em>Food</em>
        </h1>
        <p className="count">
          {count === total ? total : `${count} sur ${total}`} adresse{total > 1 ? 's' : ''}
        </p>
      </div>
      <div className="filters">
        <label className="select">
          <span className="sr-only">Ville</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <fieldset className="cats">
          <legend className="sr-only">Catégories</legend>
          {CATEGORIES.map((c) => (
            <label key={c} className={`toggle cat-${c}`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={cats.includes(c)}
                onChange={(e) => setCats(e.target.checked ? [...cats, c] : cats.filter((x) => x !== c))}
              />
              <CategoryIcon category={c} />
              {CATEGORY_LABELS[c]}
            </label>
          ))}
        </fieldset>
      </div>
      <button className="primary add" onClick={onAdd}>
        <Plus /> Ajouter une adresse
      </button>
    </header>
  );
}
