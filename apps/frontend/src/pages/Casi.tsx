import { useParams, useNavigate } from 'react-router-dom';
import { macrotemi } from '../data/macrotemi';
import { concetti } from '../data/concetti';
import { casi as casiStatici } from '../data/casi';
import { useApp } from '../store/AppContext';
import Briciola from '../components/Briciola';
import Card from '../components/Card';

export default function Casi() {
  const { macrotemaId, concettoId } = useParams<{ macrotemaId: string; concettoId: string }>();
  const navigate = useNavigate();
  const { state } = useApp();

  const tema = macrotemi.find(m => m.id === macrotemaId);
  const concetto = concetti.find(c => c.id === concettoId);

  if (!tema || !concetto) {
    return <div>Concetto non trovato.</div>;
  }

  const tuttiCasi = [
    ...casiStatici.filter(c => c.concettoId === concettoId),
    ...state.casiGenerati.filter(c => c.concettoId === concettoId),
  ];

  return (
    <div>
      <Briciola
        voci={[
          { label: 'Temi', href: '/' },
          { label: tema.nome, href: `/tema/${macrotemaId}` },
          { label: concetto.nome },
        ]}
      />

      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        {concetto.nome}
      </h1>

      {tuttiCasi.length === 0 && (
        <p style={{ color: '#6C6B60', fontSize: 15 }}>
          Nessun caso disponibile per questo concetto.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tuttiCasi.map(caso => {
          const risultato = state.risultati.find(r => r.casoId === caso.id);
          const completato = !!risultato;

          return (
            <Card key={caso.id} onClick={() => navigate(`/caso/${caso.id}`)}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className="chip-forte">{concetto.nome}</span>
                <span className="chip-tenue">{caso.tagSecondario}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#1B1B17' }}>
                {caso.titolo}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: completato ? '#06291A' : '#6C6B60' }}>
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: 18, color: completato ? '#7FD6A6' : '#B0AFA4' }}
                >
                  {completato ? 'check_circle' : 'circle'}
                </span>
                {completato ? `${risultato.punteggio} punti` : 'Mai aperto'}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
