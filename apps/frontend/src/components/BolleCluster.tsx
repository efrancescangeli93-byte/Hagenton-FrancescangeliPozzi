import { useEffect, useState } from 'react';
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

function useWidth(): number {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export default function BolleCluster({ bolle, tutteUguali = false }: Props) {
  const w = useWidth();
  const mobile = w < 600;

  // Tutte le bolle hanno la stessa dimensione; layout a griglia ordinata e centrata.
  const size = tutteUguali
    ? (mobile ? 112 : 132)
    : (mobile ? 104 : w >= 1440 ? 140 : 120);

  return (
    <div className="bolla-cluster-container">
      {bolle.map((b) => (
        <Bolla
          key={b.id}
          label={b.label}
          sublabel={b.sublabel}
          colore={b.colore}
          testoColore={b.testoColore}
          size={size}
          onClick={b.onClick}
        />
      ))}
    </div>
  );
}
