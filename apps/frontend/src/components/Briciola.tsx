import React from 'react';
import { Link } from 'react-router-dom';

type Voce = {
  label: string;
  href?: string;
};

type Props = {
  voci: Voce[];
};

export default function Briciola({ voci }: Props) {
  return (
    <nav className="briciola" aria-label="Percorso di navigazione">
      {voci.map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="briciola-sep" aria-hidden="true">·</span>}
          {v.href ? (
            <Link to={v.href}>{v.label}</Link>
          ) : (
            <span aria-current="page">{v.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
