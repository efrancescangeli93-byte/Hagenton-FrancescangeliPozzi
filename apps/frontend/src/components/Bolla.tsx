type Props = {
  label: string;
  sublabel?: string;
  colore: string;
  testoColore: string;
  size: number;
  onClick: () => void;
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function Bolla({ label, sublabel, colore, testoColore, size, onClick }: Props) {
  const h = hashStr(label);
  const delay = (h % 20) / 10;        // 0.0 - 1.9s: galleggiamento sfalsato
  const dur = 3.6 + (h % 15) / 10;    // 3.6 - 5.0s: durata variata

  return (
    <span className="bolla-wrap" style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
      <button
        className="bolla"
        style={{ width: size, height: size, backgroundColor: colore, color: testoColore }}
        onClick={onClick}
      >
        <span style={{ fontSize: size < 100 ? 12 : 13, lineHeight: 1.25, padding: '0 6px' }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: 10, opacity: 0.7, padding: '0 4px' }}>
            {sublabel}
          </span>
        )}
      </button>
    </span>
  );
}
