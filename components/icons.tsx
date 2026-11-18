const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const Plus = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Close = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Locate = () => (
  <svg {...base}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

// Plain path strings so Leaflet's divIcon HTML can reuse them.
export const CATEGORY_PATHS = {
  restaurant: 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
  snack: 'M4 10a8 6 0 0116 0zM3 14h18M5 17.5h14l-1 2.5H6z',
  hotel: 'M3 6v14M3 16h18v4M21 16v-3a3 3 0 00-3-3h-7v6M7 13a1.5 1.5 0 100-.01',
} as const;

export const CategoryIcon = ({ category }: { category: keyof typeof CATEGORY_PATHS }) => (
  <svg {...base} width={15} height={15}>
    <path d={CATEGORY_PATHS[category]} />
  </svg>
);
