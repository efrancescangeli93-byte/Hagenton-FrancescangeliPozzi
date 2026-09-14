import { useState } from 'react';
import { macrotemi } from '../data/macrotemi';
import { concetti } from '../data/concetti';
import { casi } from '../data/casi';
import { useApp } from '../store/AppContext';
import RadarSvg from '../components/RadarSvg';

type Vista = 'macrotemi' | 'concetti';

export default function Progressi() {
  const { state } = useApp();
  const [vista, setVista] = useState<Vista>('macrotemi');

  const punteggiPerTema: Record<string, number> = {};
  macrotemi.forEach(tema => {
    const casiTema = [...casi, ...state.casiGenerati].filter(c => {
      const mt = concetti.find(x => x.id === c.concettoId)?.macrotemaId ?? c.macrotemaId;
      return mt === tema.id;
    });
    if (casiTema.length === 0) {
      punteggiPerTema[tema.id] = 0;
    } else {
      const risultatiTema = casiTema
        .map(c => state.risultati.find(r => r.casoId === c.id))
        .filter((r): r is NonNullable<typeof r> => r !== undefined);
      if (risultatiTema.length === 0) {
        punteggiPerTema[tema.id] = 0;
      } else {
        const media = risultatiTema.reduce((acc, r) => acc + r.punteggio, 0) / risultatiTema.length;
        punteggiPerTema[tema.id] = Math.round(media);
      }
    }
  });

  const punteggiPerConcetto = concetti.map(c => {
    const casiConcetto = [...casi, ...state.casiGenerati].filter(ca => ca.concettoId === c.id);
    const risultatiConcetto = casiConcetto
      .map(ca => state.risultati.find(r => r.casoId === ca.id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
    const punteggio = risultatiConcetto.length === 0
      ? 0
      : Math.round(risultatiConcetto.reduce((acc, r) => acc + r.punteggio, 0) / risultatiConcetto.length);
    return { nome: c.nome, macrotemaId: c.macrotemaId, punteggio };
  });

  const temiOrdinati = [...macrotemi].sort((a, b) => (punteggiPerTema[a.id] ?? 0) - (punteggiPerTema[b.id] ?? 0));
  const puntoDebole = temiOrdinati[0];

  const temiDecrescenti = [...macrotemi].sort((a, b) => (punteggiPerTema[b.id] ?? 0) - (punteggiPerTema[a.id] ?? 0));

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Progressi</h1>

      <div className="segmentato" role="group" aria-label="Vista progressi">
        <button
          className={'segmentato-btn' + (vista === 'macrotemi' ? ' attivo' : '')}
          onClick={() => setVista('macrotemi')}
          aria-pressed={vista === 'macrotemi'}
        >
          Macrotemi
        </button>
        <button
          className={'segmentato-btn' + (vista === 'concetti' ? ' attivo' : '')}
          onClick={() => setVista('concetti')}
          aria-pressed={vista === 'concetti'}
        >
          Concetti
        </button>
      </div>

      <div style={{ marginBottom: 32 }}>
        <RadarSvg punteggi={punteggiPerTema} />
      </div>

      {vista === 'macrotemi' ? (
        <div>
          {temiDecrescenti.map(t => (
            <div key={t.id} className="tema-row">
              <div className="tema-dot" style={{ backgroundColor: t.colore }} aria-hidden="true" />
              <span className="tema-nome">{t.nome}</span>
              <span className="tema-punteggio">
                {(punteggiPerTema[t.id] ?? 0) > 0 ? `${punteggiPerTema[t.id]}` : '—'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {[...punteggiPerConcetto]
            .sort((a, b) => b.punteggio - a.punteggio)
            .map((c, i) => {
              const tema = macrotemi.find(m => m.id === c.macrotemaId);
              return (
                <div key={i} className="tema-row">
                  <div className="tema-dot" style={{ backgroundColor: tema?.colore ?? '#ccc' }} aria-hidden="true" />
                  <span className="tema-nome">{c.nome}</span>
                  <span className="tema-punteggio">
                    {c.punteggio > 0 ? `${c.punteggio}` : '—'}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {puntoDebole && (
        <div className="punto-debole">
          <strong>Punto debole:</strong>{' '}
          {puntoDebole.nome}
          {(punteggiPerTema[puntoDebole.id] ?? 0) > 0
            ? ` (${punteggiPerTema[puntoDebole.id]} punti in media)`
            : ' — nessun caso completato'}
        </div>
      )}
    </div>
  );
}
