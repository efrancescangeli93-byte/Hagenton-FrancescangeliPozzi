import { useEffect, useRef, useState } from 'react';
import Bolla from './Bolla';

type BollaData = {
  id: string;
  label: string;
  sublabel?: string;
  colore: string;
  testoColore: string;
  onClick: () => void;
};

type Props = {
  bolle: BollaData[];
  tutteUguali?: boolean;
};

type Punto = { x: number; y: number };

function disponi(n: number, width: number, size: number): { pts: Punto[]; height: number } {
  const pad = 12;
  if (n <= 0) return { pts: [], height: size + 24 };
  if (n === 1) {
    const h = size + 56;
    return { pts: [{ x: width / 2, y: h / 2 }], height: h };
  }

  // Fino a 8: anello singolo, cerchio ampio e leggibile con lieve sovrapposizione.
  if (n <= 8) {
    const dist = size * 0.98; // distanza centro-centro
    let R = dist / (2 * Math.sin(Math.PI / n));
    const Rmax = width / 2 - size / 2 - pad;
    if (Rmax > size * 0.5) R = Math.min(R, Rmax);
    const height = 2 * R + size + 36;
    const cx = width / 2;
    const cy = height / 2;
    const pts: Punto[] = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
    }
    return { pts, height };
  }

  // Tanti elementi (es. 30): spirale a girasole, packing a disco che scala bene.
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spacing = size * 0.66;
  const raw: { r: number; a: number }[] = [];
  let maxR = 0;
  for (let i = 0; i < n; i++) {
    const r = spacing * Math.sqrt(i + 0.5);
    const a = i * golden;
    raw.push({ r, a });
    maxR = Math.max(maxR, r);
  }
  const height = 2 * maxR + size + 36;
  const cx = width / 2;
  const cy = height / 2;
  const pts = raw.map(({ r, a }) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }));
  return { pts, height };
}

export default function BolleCluster({ bolle, tutteUguali = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const update = () => { if (ref.current) setW(ref.current.offsetWidth); };
    update();
    const ro = new ResizeObserver(update);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const width = w || 800;
  const mobile = width < 600;
  const size = tutteUguali ? (mobile ? 100 : 124) : (mobile ? 96 : 116);

  const { pts, height } = disponi(bolle.length, width, size);

  return (
    <div ref={ref} className="bolla-cluster-container" style={{ height }}>
      {bolle.map((b, i) => (
        <span
          key={b.id}
          className="bolla-pos"
          style={{ left: pts[i]?.x ?? width / 2, top: pts[i]?.y ?? height / 2 }}
        >
          <Bolla
            label={b.label}
            sublabel={b.sublabel}
            colore={b.colore}
            testoColore={b.testoColore}
            size={size}
            onClick={b.onClick}
          />
        </span>
      ))}
    </div>
  );
}
