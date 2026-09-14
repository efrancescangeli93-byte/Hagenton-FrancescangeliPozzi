import React from 'react';

type Props = {
  numero: number;
  label: string;
  testo: React.ReactNode;
  variant?: 'normale' | 'trappola' | 'numeri' | 'termine';
  letto: boolean;
  entrata: boolean;
};

const LABELS: Record<number, string> = {
  1: 'Il fatto',
  2: 'La trappola',
  3: 'La spiegazione',
  4: "L'analogia",
  5: 'I numeri',
  6: 'Il termine tecnico',
  7: 'Mettilo alla prova',
  8: 'Cosa farne',
};

export default function SlotRenderer({ numero, label, testo, variant = 'normale', letto, entrata }: Props) {
  const displayLabel = label || LABELS[numero] || `Slot ${numero}`;

  const slotClass = [
    'slot',
    variant === 'trappola' ? 'slot-trappola' : '',
    variant === 'numeri'   ? 'slot-numeri'   : '',
    variant === 'termine'  ? 'slot-termine'  : '',
    letto    ? 'slot-letto'   : '',
    entrata  ? 'slot-entrata' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={slotClass}>
      <div className="slot-pallino" aria-hidden="true">
        {numero}
      </div>
      <div className="slot-body">
        <div className="slot-label">{displayLabel}</div>
        <div className="slot-testo">{testo}</div>
      </div>
    </div>
  );
}
