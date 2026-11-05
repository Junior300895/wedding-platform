/**
 * Bouquet d'angle de l'enveloppe : orchidee, renoncule, myosotis, feuillage
 * et feuilles dorees. Dessine en SVG pour rester net et sans fichier a charger.
 */
const PETAL_SIDE = "M0 0C-14 -30 -52 -44 -74 -26C-88 -12 -72 18 -40 22C-22 24 -8 14 0 0Z";
const PETAL_TOP = "M0 0C-20 -22 -24 -58 0 -74C24 -58 20 -22 0 0Z";
const PETAL_LOW = "M0 0C-8 18 -34 42 -48 34C-58 22 -38 -2 0 0Z";
const LEAF = "M0 0C8 -10 26 -12 38 0C26 12 8 10 0 0Z";

function Forget({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="0" cy="-6" r="5" fill="#9db8dc" transform={`rotate(${a})`} />
      ))}
      <circle r="2.6" fill="#e9b949" />
    </g>
  );
}

function Stem({ d, berries }: { d: string; berries: [number, number][] }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#a48a5a" strokeWidth="1" />
      {berries.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fbf6e9" stroke="#d8c8a3" strokeWidth=".6" />
      ))}
    </g>
  );
}

export function EnvelopeFlowers({ id, className }: { id: string; className?: string }) {
  const petal = `${id}-petal`;
  const gold = `${id}-gold`;
  const peach = `${id}-peach`;
  const lip = `${id}-lip`;

  return (
    <svg viewBox="0 0 220 200" className={className} aria-hidden="true">
      <defs>
        <path id={`${id}-leaf`} d={LEAF} />
        <radialGradient id={petal} cx="85%" cy="50%" r="95%">
          <stop offset="0%" stopColor="#efe2c8" />
          <stop offset="55%" stopColor="#fbf6ea" />
          <stop offset="100%" stopColor="#fffdf8" />
        </radialGradient>
        <linearGradient id={gold} x1="0" x2="1">
          <stop offset="0%" stopColor="#f0e0b8" />
          <stop offset="100%" stopColor="#b8924f" />
        </linearGradient>
        <radialGradient id={peach}>
          <stop offset="0%" stopColor="#c9603f" />
          <stop offset="100%" stopColor="#f0a287" />
        </radialGradient>
        <radialGradient id={lip}>
          <stop offset="0%" stopColor="#d9531e" />
          <stop offset="100%" stopColor="#f3c14f" />
        </radialGradient>
      </defs>

      <Stem d="M70 70C110 72 160 66 205 76" berries={[[128, 58], [146, 60], [160, 62]]} />
      <Stem d="M70 70C60 110 62 150 56 190" berries={[[42, 118], [48, 136], [70, 128], [44, 170]]} />
      <Stem d="M70 70C50 50 36 30 10 12" berries={[[52, 24], [66, 16], [44, 40]]} />

      {/* Feuillage eucalyptus */}
      <g fill="#7f9a93">
        <use href={`#${id}-leaf`} transform="translate(150 72) rotate(-20) scale(.55)" />
        <use href={`#${id}-leaf`} transform="translate(168 70) rotate(22) scale(.55)" />
        <use href={`#${id}-leaf`} transform="translate(186 72) rotate(-14) scale(.5)" />
        <use href={`#${id}-leaf`} transform="translate(60 108) rotate(150) scale(.6)" />
        <use href={`#${id}-leaf`} transform="translate(58 142) rotate(30) scale(.5)" />
      </g>

      {/* Feuilles dorees */}
      <g fill={`url(#${gold})`} stroke="#9c7a3e" strokeWidth=".5">
        <path d="M44 48C28 42 12 24 4 4C24 8 42 24 50 40Z" />
        <path d="M46 138C32 150 28 170 40 192C54 176 58 154 54 138Z" />
        <path d="M112 34C118 22 132 14 146 14C142 28 130 38 116 40Z" />
      </g>

      {/* Orchidee */}
      <g transform="translate(78 72)" filter="drop-shadow(0 3px 4px rgba(80,55,20,.28))">
        <path d={PETAL_TOP} fill={`url(#${petal})`} stroke="#e8dcc2" strokeWidth=".5" transform="rotate(-142) scale(.82)" />
        <path d={PETAL_TOP} fill={`url(#${petal})`} stroke="#e8dcc2" strokeWidth=".5" transform="rotate(142) scale(.82)" />
        <path d={PETAL_TOP} fill={`url(#${petal})`} stroke="#e8dcc2" strokeWidth=".5" />
        <path d={PETAL_SIDE} fill={`url(#${petal})`} stroke="#e8dcc2" strokeWidth=".5" />
        <path d={PETAL_SIDE} fill={`url(#${petal})`} stroke="#e8dcc2" strokeWidth=".5" transform="scale(-1 1)" />
        <path d={PETAL_LOW} fill="#f6e3a6" transform="translate(2 6) scale(.42)" />
        <path d={PETAL_LOW} fill="#f6e3a6" transform="translate(-2 6) scale(-.42 .42)" />
        <ellipse cy="12" rx="10" ry="12" fill={`url(#${lip})`} />
        <circle cy="-1" r="4.5" fill="#fff6dc" stroke="#e0a13c" strokeWidth=".8" />
      </g>

      {/* Renoncule */}
      <g transform="translate(142 66)">
        <circle r="15" fill={`url(#${peach})`} />
        <path d="M-9 2A10 10 0 0 1 9 -3M-6 7A8 8 0 0 1 8 3M-4 -4A5 5 0 0 1 5 -4" fill="none" stroke="#b6502f" strokeWidth="1" />
      </g>

      <Forget x={110} y={100} scale={1.15} />
      <Forget x={128} y={92} scale={0.9} />
      <Forget x={40} y={106} scale={1.1} />
      <Forget x={54} y={158} scale={0.8} />
    </svg>
  );
}
