import { macrotemi } from '../data/macrotemi';

type Props = {
  punteggi: Record<string, number>;
};

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 100;

const ASSI = macrotemi.slice().sort((a, b) => a.ordine - b.ordine);

function angleFor(idx: number): number {
  return ((-90 + idx * 60) * Math.PI) / 180;
}

function vertex(idx: number, r: number): [number, number] {
  const a = angleFor(idx);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function hexagon(r: number): string {
  return ASSI.map((_, i) => vertex(i, r).join(',')).join(' ');
}

export default function RadarSvg({ punteggi }: Props) {
  const rings = [20, 40, 60, 80, 100];

  const poligonoUtente = ASSI.map((t, i) => {
    const pct = Math.max(0, Math.min(100, punteggi[t.id] ?? 0));
    const r = (pct / 100) * R;
    return vertex(i, r).join(',');
  }).join(' ');

  const ariaLabel = 'Radar progressi: ' +
    ASSI.map(t => `${t.nome} ${Math.round(punteggi[t.id] ?? 0)}%`).join(', ');

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', maxWidth: '100%', margin: '0 auto' }}
    >
      {rings.map(v => (
        <polygon
          key={v}
          points={hexagon((v / 100) * R)}
          fill="none"
          stroke="#E0DCC6"
          strokeWidth={0.8}
        />
      ))}

      {ASSI.map((_, i) => {
        const [x2, y2] = vertex(i, R);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={x2} y2={y2}
            stroke="#E0DCC6"
            strokeWidth={0.8}
          />
        );
      })}

      <polygon
        points={poligonoUtente}
        fill="#6B6753"
        fillOpacity={0.10}
        stroke="#6B6753"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {ASSI.map((t, i) => {
        const pct = punteggi[t.id] ?? 0;
        const r = (Math.max(0, Math.min(100, pct)) / 100) * R;
        const [cx2, cy2] = vertex(i, r);
        const hasCheck = pct > 0;
        return (
          <circle
            key={t.id}
            cx={cx2}
            cy={cy2}
            r={6}
            fill={hasCheck ? t.colore : 'var(--bg, #F6F6F3)'}
            stroke={t.colore}
            strokeWidth={1.5}
          />
        );
      })}

      {ASSI.map((t, i) => {
        const [x, y] = vertex(i, R + 18);
        const anchor =
          Math.abs(x - CX) < 5 ? 'middle'
          : x < CX ? 'end'
          : 'start';
        return (
          <text
            key={t.id}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            fontSize={12}
            fontFamily="Roboto, sans-serif"
            fill="#55544A"
          >
            {t.nome}
          </text>
        );
      })}

      {rings.map(v => {
        const [, y] = vertex(0, (v / 100) * R);
        return (
          <text
            key={v}
            x={CX + 4}
            y={y - 2}
            fontSize={10.5}
            fontFamily="Roboto, sans-serif"
            fill="#8D8B7C"
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}
