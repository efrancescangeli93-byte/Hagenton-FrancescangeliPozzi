import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { macrotemi } from '../data/macrotemi';
import { concetti } from '../data/concetti';
import { useApp } from '../store/AppContext';
import { generaCaso } from '../api';
import BolleCluster from '../components/BolleCluster';
import Briciola from '../components/Briciola';

const FINANZA_TONI = [
  '#FDF0C4', '#FBE49A', '#F9D96E', '#F7CE46',
  '#F3C536', '#EFBB22', '#E3AE14', '#D9A400',
];

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function hslInterpolate(coloreBase: string, n: number, i: number): { bg: string; testo: string } {
  const r = parseInt(coloreBase.slice(1, 3), 16);
  const g = parseInt(coloreBase.slice(3, 5), 16);
  const b = parseInt(coloreBase.slice(5, 7), 16);

  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l0 = (max + min) / 2;
  const d = max - min;
  const s0 = d === 0 ? 0 : d / (1 - Math.abs(2 * l0 - 1));
  let h0 = 0;
  if (d !== 0) {
    if (max === rn) h0 = ((gn - bn) / d) % 6;
    else if (max === gn) h0 = (bn - rn) / d + 2;
    else h0 = (rn - gn) / d + 4;
    h0 = h0 * 60;
    if (h0 < 0) h0 += 360;
  }

  const lightness = 0.92 - (i / (n - 1)) * (0.92 - l0);
  const bg = `hsl(${h0.toFixed(0)}, ${(s0 * 100).toFixed(0)}%, ${(lightness * 100).toFixed(0)}%)`;
  const testo = lightness > 0.6 ? '#1B1B17' : '#fff';
  return { bg, testo };
}

export default function Tema() {
  const { macrotemaId } = useParams<{ macrotemaId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const [parola, setParola] = useState('');
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const tema = macrotemi.find(m => m.id === macrotemaId);
  if (!tema) {
    return <div>Tema non trovato.</div>;
  }

  const concettiTema = concetti.filter(c => c.macrotemaId === macrotemaId);
  const generatiTema = state.casiGenerati.filter(c => c.macrotemaId === macrotemaId);

  const bolle = concettiTema.map(c => {
    let colore: string;
    let testoColore: string;

    if (macrotemaId === 'finanza') {
      const idx = simpleHash(c.nome) % 8;
      colore = FINANZA_TONI[idx];
      testoColore = '#3D2E00';
    } else {
      const idx = simpleHash(c.nome) % 8;
      const { bg, testo } = hslInterpolate(tema.colore, 8, idx);
      colore = bg;
      testoColore = testo;
    }

    return {
      id: c.id,
      label: c.nome,
      colore,
      testoColore,
      onClick: () => navigate(`/tema/${macrotemaId}/concetto/${c.id}`),
    };
  });

  async function genera() {
    const q = parola.trim();
    if (!q || loading) return;
    setLoading(true);
    setErrore('');
    try {
      const caso = await generaCaso(q);
      dispatch({ type: 'AGGIUNGI_CASO', payload: caso });
      navigate(`/caso/${caso.id}`);
    } catch (e) {
      setErrore((e as Error).message || 'Non sono riuscito a generare il caso. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Briciola
        voci={[
          { label: 'Temi', href: '/' },
          { label: tema.nome },
        ]}
      />
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        {tema.nome}
      </h1>

      {macrotemaId === 'finanza' && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
            Non trovi il concetto che ti serve?
          </div>
          <div style={{ fontSize: 13, color: '#6C6B60', marginBottom: 12 }}>
            Scrivi una parola e ne generiamo un caso su misura.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={parola}
              onChange={e => setParola(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') genera(); }}
              placeholder="es. spread, mutuo, cashback..."
              disabled={loading}
              style={{
                flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 19,
                border: '1px solid #E3E3DC', fontSize: 14, fontFamily: 'inherit',
              }}
            />
            <button className="btn-primary" onClick={genera} disabled={loading || !parola.trim()}>
              {loading ? 'Genero...' : 'Genera un caso'}
            </button>
          </div>
          {errore && <div className="quiz-errore" style={{ marginTop: 8 }}>{errore}</div>}
        </div>
      )}

      <BolleCluster bolle={bolle} tutteUguali />

      {generatiTema.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Casi generati</h2>
          {generatiTema.map(c => (
            <div
              key={c.id}
              className="card"
              style={{ marginBottom: 10, cursor: 'pointer' }}
              onClick={() => navigate(`/caso/${c.id}`)}
            >
              <div style={{ fontSize: 15, fontWeight: 500 }}>{c.titolo}</div>
              {c.slot6Termine && (
                <div style={{ fontSize: 13, color: '#6C6B60', marginTop: 2 }}>{c.slot6Termine}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
