import { useNavigate } from 'react-router-dom';
import BolleCluster from '../components/BolleCluster';
import { macrotemi } from '../data/macrotemi';
import { apriRicerca } from '../components/RicercaDialog';
import { useApp } from '../store/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { state } = useApp();

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

      {state.casiGenerati.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>I tuoi casi generati</h2>
          {state.casiGenerati.slice().reverse().map(c => {
            const t = macrotemi.find(m => m.id === c.macrotemaId);
            return (
              <div
                key={c.id}
                className="card"
                style={{ marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                onClick={() => navigate(`/caso/${c.id}`)}
              >
                {t && <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.colore, flexShrink: 0 }} aria-hidden="true" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{c.titolo}</div>
                  {t && <div style={{ fontSize: 12, color: '#6C6B60' }}>{t.nome}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
