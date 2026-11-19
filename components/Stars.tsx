type Props = {
  value: number | null;
  // Without onChange the stars are display only.
  onChange?: (stars: number | null) => void;
  disabled?: boolean;
};

const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  </svg>
);

export default function Stars({ value, onChange, disabled }: Props) {
  if (!onChange)
    return (
      <span className="stars" role="img" aria-label={value ? `${value} sur 5` : 'Pas encore noté'}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={value && n <= value ? 'on' : ''}>
            <Star />
          </span>
        ))}
      </span>
    );
  return (
    <span className="stars stars-input" role="group" aria-label="Note">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={value && n <= value ? 'on' : ''}
          aria-label={`${n} sur 5`}
          aria-pressed={value === n}
          disabled={disabled}
          // Clicking the current rating clears it.
          onClick={() => onChange(value === n ? null : n)}
        >
          <Star />
        </button>
      ))}
    </span>
  );
}
