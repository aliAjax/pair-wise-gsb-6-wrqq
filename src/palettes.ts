// Color scheme data for each pairing: types, defaults, seeds and storage
// migration. Contrast math lives in contrast.ts; rendering lives in
// ColorCard.tsx and App.tsx.

export type Palette = {
  background: string;
  text: string;
  accent: string;
};

export type Pair = {
  id: number;
  title: string;
  heading: string;
  body: string;
  category: string;
  favorite: boolean;
  colors: Palette;
};

export const DEFAULT_PALETTE: Palette = {
  background: '#f3efe9',
  text: '#293839',
  accent: '#ac7555',
};

export const seedPairs: Pair[] = [
  {
    id: 1,
    title: 'Editorial calm',
    heading: 'A slower way to see',
    body: 'Good typography creates space for ideas to breathe. Pair a confident display face with a quiet, generous text face.',
    category: 'Editorial',
    favorite: true,
    colors: {background: '#f3efe9', text: '#293839', accent: '#ac7555'},
  },
  {
    id: 2,
    title: 'Studio notes',
    heading: 'Make room for the unexpected',
    body: 'A thoughtful pairing can add rhythm to even the simplest interface. Try contrast in shape, not just size.',
    category: 'Portfolio',
    favorite: false,
    colors: {background: '#f5f1ea', text: '#2e2a26', accent: '#7c6a9e'},
  },
  {
    id: 3,
    title: 'Field guide',
    heading: 'Small details, lasting impressions',
    body: 'Typography is the voice of a page. Find a combination that feels clear, warm and distinctly yours.',
    category: 'Brand',
    favorite: false,
    colors: {background: '#eef2ec', text: '#26332c', accent: '#4a765d'},
  },
];

/** Normalize '#abc' / 'abc' / '#AABBCC' to lowercase '#aabbcc'; null if invalid. */
export function normalizeHex(input: string): string | null {
  const hex = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return '#' + hex.split('').map(c => c + c).join('').toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return '#' + hex.toLowerCase();
  return null;
}

/** Fill in the default palette for saves written before colors existed. */
export function ensurePalette(colors: unknown): Palette {
  const c = (colors ?? {}) as Record<string, unknown>;
  const pick = (value: unknown, fallback: string): string =>
    typeof value === 'string' && normalizeHex(value) ? normalizeHex(value)! : fallback;
  return {
    background: pick(c.background, DEFAULT_PALETTE.background),
    text: pick(c.text, DEFAULT_PALETTE.text),
    accent: pick(c.accent, DEFAULT_PALETTE.accent),
  };
}

const STORAGE_KEY = 'type-pairs';

export function loadPairs(): Pair[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    if (!Array.isArray(raw)) return seedPairs;
    return raw
      .filter(p => p && typeof p.id === 'number')
      .map(p => ({...p, colors: ensurePalette(p.colors)}));
  } catch {
    return seedPairs;
  }
}

export function savePairs(pairs: Pair[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
}
