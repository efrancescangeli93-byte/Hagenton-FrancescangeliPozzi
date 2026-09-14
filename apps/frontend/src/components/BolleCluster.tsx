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

function disponiInCerchio(n: number, width: number, size: number): { pts: Punto[]; height: number } {
  const pad = 8;
  if (n <= 0) return { pts: [], height: size + 24 };
  if (n === 1) {
    const h = size + 48;
    return { pts: [{ x: width / 2, y: h / 2 }], height: h };
  }
  // Raggio per un anello con leggera sovrapposizione ("bolle che si intersecano")
  let R = (n * size * 0.72) / (2 * Math.PI);
  const Rmax = width / 2 - size / 2 - pad;
  R = Math.min(R, Math.max(Rmax, size * 0.6));
  R = Math.max(R, size * 0.55);
  const height = 2 * R + size + 24;
  const cx = width / 2;
  const cy = height / 2;
  const pts: Punto[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
  }
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
  const size = tutteUguali ? (mobile ? 96 : 118) : (mobile ? 92 : 112);

  const { pts, height } = disponiInCerchio(bolle.length, width, size);

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
