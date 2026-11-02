// Prototype (replica/ideas.md): small food drawings that move once, on mount. Inline SVG + CSS, ~2 KB,
// colours from tokens. Shown only on /?design until the owner says yes. Decorative: aria-hidden.
const svg = (cls, children) => (
  <svg className={`food-motion ${cls}`} viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false">{children}</svg>
)

export const Egg = () => svg('fm-egg', <>
  <path className="fm-white" d="M14 34c-4-9 4-17 13-16 5-6 16-5 20 2 8 1 10 11 4 16 1 8-9 12-16 9-6 4-18 1-19-6-3-1-3-4-2-5z" />
  <circle className="fm-yolk" cx="33" cy="33" r="8" />
  <circle className="fm-shine" cx="30" cy="30" r="2" />
</>)

export const Drumstick = () => svg('fm-drum', <>
  <path className="fm-steam" d="M26 14c-3-3 3-5 0-9M34 14c-3-3 3-5 0-9M42 16c-3-3 3-5 0-9" />
  <path className="fm-meat" d="M18 40c-6-10 6-22 18-20 12 2 14 16 6 22-5 4-12 4-16 2z" />
  <path className="fm-bone" d="M26 42l-8 8m0 0c-2-3-6-1-5 2-3 0-4 4-1 5 1 3 5 3 6 0 3-1 2-5 0-7z" />
</>)

export const Avocado = () => svg('fm-avo', <>
  <path className="fm-skin" d="M32 6c-8 0-10 14-15 22-6 10-2 30 15 30s21-20 15-30C42 20 40 6 32 6z" />
  <path className="fm-flesh" d="M32 12c-5 0-7 11-11 18-4 8-1 22 11 22s15-14 11-22c-4-7-6-18-11-18z" />
  <circle className="fm-pit" cx="32" cy="40" r="7" />
</>)
