// WCAG contrast determination for pairing palettes. Pure logic, no UI:
// data comes from palettes.ts, rendering happens in ColorCard.tsx / App.tsx.
import {normalizeHex, type Palette} from './palettes';

export const BODY_TEXT_MIN_RATIO = 4.5; // WCAG AA for body text
export const ACCENT_MIN_RATIO = 3; // WCAG AA for non-text accents

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance of a hex color, or null when the color is invalid. */
export function relativeLuminance(hex: string): number | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** Contrast ratio between two hex colors. Invalid colors fail safe (1:1). */
export function contrastRatio(foreground: string, background: string): number {
  const lf = relativeLuminance(foreground);
  const lb = relativeLuminance(background);
  if (lf === null || lb === null) return 1;
  const [lighter, darker] = lf >= lb ? [lf, lb] : [lb, lf];
  return (lighter + 0.05) / (darker + 0.05);
}

export type PaletteCheck = {
  bodyRatio: number;
  accentRatio: number;
  bodyOk: boolean;
  accentOk: boolean;
  ready: boolean;
};

export function checkPalette(palette: Palette): PaletteCheck {
  const bodyRatio = contrastRatio(palette.text, palette.background);
  const accentRatio = contrastRatio(palette.accent, palette.background);
  const bodyOk = bodyRatio >= BODY_TEXT_MIN_RATIO;
  const accentOk = accentRatio >= ACCENT_MIN_RATIO;
  return {bodyRatio, accentRatio, bodyOk, accentOk, ready: bodyOk && accentOk};
}

export type PairStatus = 'ready' | 'pending';

/** A pairing is publishable only when every contrast gate passes. */
export function pairStatus(palette: Palette): PairStatus {
  return checkPalette(palette).ready ? 'ready' : 'pending';
}
