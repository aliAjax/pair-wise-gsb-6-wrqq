// Color scheme card UI. Palette data comes from palettes.ts, all contrast
// verdicts from contrast.ts — this component only renders and reports edits.
import {useEffect, useState} from 'react';
import {AlertTriangle, Check, Palette as PaletteIcon} from 'lucide-react';
import {normalizeHex, type Palette} from './palettes';
import {
  ACCENT_MIN_RATIO,
  BODY_TEXT_MIN_RATIO,
  type PaletteCheck,
} from './contrast';

type ColorKey = keyof Palette;

const FIELDS: {key: ColorKey; label: string; hint: string}[] = [
  {key: 'background', label: 'Background', hint: 'Reference canvas'},
  {key: 'text', label: 'Body text', hint: `Needs ${BODY_TEXT_MIN_RATIO}:1 on background`},
  {key: 'accent', label: 'Accent', hint: `Needs ${ACCENT_MIN_RATIO}:1 on background`},
];

type FieldProps = {
  label: string;
  hint: string;
  value: string;
  ratio: number | null;
  ok: boolean;
  onChange: (value: string) => void;
};

function ColorField({label, hint, value, ratio, ok, onChange}: FieldProps) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const commit = (next: string) => {
    setText(next);
    const normalized = normalizeHex(next);
    if (normalized) onChange(normalized);
  };
  return (
    <div className="color-field">
      <div className="color-field-head">
        <span>{label}</span>
        {ratio !== null && (
          <span className={ok ? 'ratio ok' : 'ratio bad'}>
            {ok ? <Check size={11}/> : <AlertTriangle size={11}/>}
            {ratio.toFixed(2)}:1
          </span>
        )}
      </div>
      <div className="color-inputs">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={normalizeHex(text) ?? '#000000'}
          onChange={e => commit(e.target.value)}
        />
        <input
          className="hex"
          aria-label={`${label} hex`}
          value={text}
          spellCheck={false}
          onChange={e => commit(e.target.value)}
        />
      </div>
      <small>{hint}</small>
    </div>
  );
}

type CardProps = {
  palette: Palette;
  check: PaletteCheck;
  onChange: (key: ColorKey, value: string) => void;
};

export default function ColorCard({palette, check, onChange}: CardProps) {
  const ratioFor = (key: ColorKey): number | null =>
    key === 'text' ? check.bodyRatio : key === 'accent' ? check.accentRatio : null;
  const okFor = (key: ColorKey): boolean =>
    key === 'text' ? check.bodyOk : key === 'accent' ? check.accentOk : true;
  return (
    <div className="color-card">
      <div className="color-card-head">
        <div>
          <span>COLOR SCHEME</span>
          <h3>Palette &amp; contrast</h3>
        </div>
        <PaletteIcon size={17}/>
      </div>
      <div className="color-grid">
        {FIELDS.map(f => (
          <ColorField
            key={f.key}
            label={f.label}
            hint={f.hint}
            value={palette[f.key]}
            ratio={ratioFor(f.key)}
            ok={okFor(f.key)}
            onChange={value => onChange(f.key, value)}
          />
        ))}
      </div>
      <div className={check.ready ? 'color-status ready' : 'color-status pending'}>
        {check.ready ? (
          <><Check size={13}/> Ready to publish — all contrast checks pass.</>
        ) : (
          <>
            <AlertTriangle size={13}/> Pending —
            {!check.bodyOk && ` body text ${check.bodyRatio.toFixed(2)}:1 is below ${BODY_TEXT_MIN_RATIO}:1.`}
            {!check.accentOk && ` accent ${check.accentRatio.toFixed(2)}:1 is below ${ACCENT_MIN_RATIO}:1.`}
          </>
        )}
      </div>
    </div>
  );
}
