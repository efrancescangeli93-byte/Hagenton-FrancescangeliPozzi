import { useNavigate } from 'react-router-dom';
import BolleCluster from '../components/BolleCluster';
import { macrotemi } from '../data/macrotemi';
import { apriRicerca } from '../components/RicercaDialog';

export default function Home() {
  const navigate = useNavigate();

  const bolle = macrotemi.map(m => ({
    id: m.id,
    label: m.nome,
    colore: m.colore,
    testoColore: m.testoSuColore,
    onClick: () => navigate(`/tema/${m.id}`),
  }));

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 24, lineHeight: 1.3 }}>
        Da dove vuoi partire?
      </h1>

      <button
        className="btn-secondary"
        onClick={apriRicerca}
        style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>search</span>
        Cerca un concetto
        <span style={{ marginLeft: 4, fontSize: 12, color: '#B0AFA4' }}>/ o Ctrl+K</span>
      </button>

      <BolleCluster bolle={bolle} />
    </div>
  );
}
