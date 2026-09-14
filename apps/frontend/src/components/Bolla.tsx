type Props = {
  label: string;
  sublabel?: string;
  colore: string;
  testoColore: string;
  size: number;
  onClick: () => void;
};

export default function Bolla({ label, sublabel, colore, testoColore, size, onClick }: Props) {
  return (
    <button
      className="bolla"
      style={{
        width: size,
        height: size,
        backgroundColor: colore,
        color: testoColore,
      }}
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
  );
}
