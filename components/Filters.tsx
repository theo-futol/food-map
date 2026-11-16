import { CATEGORIES, type Category } from '@/lib/validate';

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
    <header className="filters">
      <h1>Food Map</h1>
      <label>
        City{' '}
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="sr-only">Categories</legend>
        {CATEGORIES.map((c) => (
          <label key={c} className={`chip chip-${c}`}>
            <input
              type="checkbox"
              checked={cats.includes(c)}
              onChange={(e) => setCats(e.target.checked ? [...cats, c] : cats.filter((x) => x !== c))}
            />
            {c}
          </label>
        ))}
      </fieldset>
      <span className="count">
        {count} / {total} places
      </span>
      <button className="primary" onClick={onAdd}>
        + Add place
      </button>
    </header>
  );
}
