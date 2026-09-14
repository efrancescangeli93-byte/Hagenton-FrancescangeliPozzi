import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casi as casiStatici } from '../data/casi';
import { concetti } from '../data/concetti';
import { macrotemi } from '../data/macrotemi';
import { useApp } from '../store/AppContext';
import SlotRenderer from '../components/SlotRenderer';
import Briciola from '../components/Briciola';

const SLOT_LABELS = [
  '',
  'Il fatto',
  'La trappola',
  'La spiegazione',
  "L'analogia",
  'I numeri',
  'Il termine tecnico',
  'Mettilo alla prova',
  'Cosa farne',
];

function computaPunteggio(tentativi: number): number {
  if (tentativi === 1) return 100;
  if (tentativi === 2) return 60;
  if (tentativi === 3) return 40;
  return 20;
}

export default function CasoPagina() {
  const { casoId } = useParams<{ casoId: string }>();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const caso = [...casiStatici, ...state.casiGenerati].find(c => c.id === casoId);

  const [slotVisibile, setSlotVisibile] = useState(0);
  const [tentativo, setTentativo] = useState(1);
  const [rispostaSelezionata, setRispostaSelezionata] = useState<number | null>(null);
  const [erroreQuiz, setErroreQuiz] = useState('');
  const [feedbackCorretto, setFeedbackCorretto] = useState(false);
  const [feedbackSbagliato, setFeedbackSbagliato] = useState(false);
  const [completato, setCompletato] = useState(false);
  const [riletturaAttiva, setRiletturaAttiva] = useState(false);

  const casoGiaCompletato = !!state.risultati.find(r => r.casoId === casoId);

  useEffect(() => {
    setSlotVisibile(0);
    setTentativo(1);
    setRispostaSelezionata(null);
    setErroreQuiz('');
    setFeedbackCorretto(false);
    setFeedbackSbagliato(false);
    setCompletato(false);
    setRiletturaAttiva(false);
  }, [casoId]);

  // Mescola le opzioni una volta per caso (la corretta non e' piu' sempre la prima).
  const opzioni = useMemo(() => {
    const a = [...(caso?.slot7Opzioni ?? [])];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [caso?.id]);

  if (!caso) {
    return <div style={{ padding: 24 }}>Caso non trovato.</div>;
  }

  const concetto = concetti.find(c => c.id === caso.concettoId);
  const tema = concetto ? macrotemi.find(m => m.id === concetto.macrotemaId) : undefined;

  const mostraTutti = (casoGiaCompletato && !riletturaAttiva) || completato;

  function prosegui() {
    if (slotVisibile < 6) {
      setSlotVisibile(v => v + 1);
    }
  }

  function handleConferma() {
    if (rispostaSelezionata === null) {
      setErroreQuiz('Seleziona una risposta');
      return;
    }
    setErroreQuiz('');
    const opzione = opzioni[rispostaSelezionata];
    if (opzione.corretta) {
      setFeedbackCorretto(true);
      setFeedbackSbagliato(false);
      const punteggio = computaPunteggio(tentativo);
      dispatch({
        type: 'SALVA_RISULTATO',
        payload: {
          casoId: caso!.id,
          punteggio,
          tentativi: tentativo,
          data: new Date().toISOString().split('T')[0],
        },
      });
      setCompletato(true);
      setSlotVisibile(7);
    } else {
      setFeedbackSbagliato(true);
      setFeedbackCorretto(false);
      setTentativo(t => t + 1);
    }
  }

  const slotsData = [
    { n: 1, label: SLOT_LABELS[1], testo: caso.slot1FattoVissuto, variant: 'normale' as const },
    { n: 2, label: SLOT_LABELS[2], testo: caso.slot2Trappola, variant: 'trappola' as const },
    { n: 3, label: SLOT_LABELS[3], testo: caso.slot3Spiegazione, variant: 'normale' as const },
    {
      n: 4, label: SLOT_LABELS[4],
      testo: (
        <>
          {caso.slot4Analogia}
          <div className="slot-limite">{caso.slot4Limite}</div>
        </>
      ),
      variant: 'normale' as const,
    },
    { n: 5, label: SLOT_LABELS[5], testo: caso.slot5Numeri, variant: 'numeri' as const },
    {
      n: 6, label: SLOT_LABELS[6],
      testo: (
        <>
          <strong>{caso.slot6Termine}</strong>
          <br />
          {caso.slot6Definizione}
          {caso.concettoCollegatoId && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#55544A' }}>
              Vedi anche:{' '}
              <button
                style={{ fontSize: 13, color: '#1B1B17', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  const c2 = concetti.find(c => c.id === caso.concettoCollegatoId);
                  if (c2) navigate(`/tema/${c2.macrotemaId}/concetto/${c2.id}`);
                }}
              >
                {concetti.find(c => c.id === caso.concettoCollegatoId)?.nome ?? caso.concettoCollegatoId}
              </button>
            </div>
          )}
        </>
      ),
      variant: 'termine' as const,
    },
  ];

  const slotDaRenderare = mostraTutti
    ? [0, 1, 2, 3, 4, 5]
    : Array.from({ length: Math.min(slotVisibile + 1, 6) }, (_, i) => i);

  return (
    <div>
      <Briciola
        voci={[
          { label: 'Temi', href: '/' },
          ...(tema ? [{ label: tema.nome, href: `/tema/${tema.id}` }] : []),
          ...(concetto ? [{ label: concetto.nome, href: tema ? `/tema/${tema.id}/concetto/${concetto.id}` : '/' }] : []),
          { label: caso.titolo },
        ]}
      />

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {concetto && <span className="chip-forte">{concetto.nome}</span>}
          <span className="chip-tenue">{caso.tagSecondario}</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.3 }}>{caso.titolo}</h1>
      </div>

      <div className="indicatore-caso" aria-label={`Progresso: slot ${slotVisibile + 1} di 8`}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={'indicatore-segmento' + (i <= (mostraTutti ? 7 : slotVisibile) ? ' attivo' : '')}
          />
        ))}
      </div>

      {casoGiaCompletato && !riletturaAttiva && !completato && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#D9F2E6', borderRadius: 10, marginBottom: 16 }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ color: '#06291A', fontSize: 18 }}>check_circle</span>
            <span style={{ fontSize: 14, color: '#06291A' }}>
              Completato — {state.risultati.find(r => r.casoId === casoId)?.punteggio} punti
            </span>
          </div>
          <button
            className="btn-secondary"
            onClick={() => { setRiletturaAttiva(true); setSlotVisibile(0); }}
          >
            Rileggi passo a passo
          </button>
        </div>
      )}

      <div className={mostraTutti ? 'caso-slot-griglia' : ''}>
        {slotDaRenderare.map(i => {
          const s = slotsData[i];
          return (
            <SlotRenderer
              key={s.n}
              numero={s.n}
              label={s.label}
              testo={s.testo}
              variant={s.variant}
              letto={mostraTutti}
              entrata={!mostraTutti && i === slotVisibile}
            />
          );
        })}
      </div>

      {(mostraTutti || slotVisibile === 6) && (
        <div style={{ marginTop: 16 }}>
          <div className="slot">
            <div className="slot-pallino" aria-hidden="true">7</div>
            <div className="slot-body">
              <div className="slot-label">{SLOT_LABELS[7]}</div>
              <div className="slot-testo" style={{ marginBottom: 16 }}>{caso.slot7Domanda}</div>

              {opzioni.map((op, i) => {
                let opClass = 'quiz-opzione';
                if (rispostaSelezionata === i) opClass += ' selezionata';
                if (feedbackSbagliato && rispostaSelezionata === i && !op.corretta) opClass += ' errata';
                if ((feedbackCorretto || completato) && op.corretta) opClass += ' corretta';

                return (
                  <button
                    key={i}
                    className={opClass}
                    onClick={() => {
                      if (feedbackCorretto || completato) return;
                      setRispostaSelezionata(i);
                      setErroreQuiz('');
                      setFeedbackSbagliato(false);
                    }}
                    disabled={feedbackCorretto || completato}
                  >
                    {op.testo}
                  </button>
                );
              })}

              {erroreQuiz && <div className="quiz-errore">{erroreQuiz}</div>}

              {feedbackSbagliato && !feedbackCorretto && (
                <div className="quiz-feedback sbagliato">
                  {caso.spiegazioneErrore || caso.slot2Trappola}
                </div>
              )}

              {(feedbackCorretto || completato) && (
                <div className="quiz-feedback corretto">
                  {caso.slot7Perche}
                </div>
              )}

              {!feedbackCorretto && !completato && (
                <button
                  className="btn-primary"
                  style={{ marginTop: 12 }}
                  onClick={handleConferma}
                >
                  Conferma
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(mostraTutti || slotVisibile === 7) && (
        <SlotRenderer
          numero={8}
          label={SLOT_LABELS[8]}
          testo={caso.slot8CosaFarne}
          variant="normale"
          letto={mostraTutti}
          entrata={!mostraTutti && slotVisibile === 7}
        />
      )}

      {!mostraTutti && slotVisibile < 6 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
          <button className="btn-primary" onClick={prosegui}>
            Prosegui
          </button>
          <span style={{ fontSize: 13, color: '#6C6B60' }}>
            {slotVisibile + 1} di 8
          </span>
        </div>
      )}

      {(completato || (casoGiaCompletato && !riletturaAttiva)) && slotVisibile === 7 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {concetto && tema && (
            <button
              className="btn-secondary"
              onClick={() => navigate(`/tema/${tema.id}/concetto/${concetto.id}`)}
            >
              Altri casi
            </button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Torna ai temi
          </button>
        </div>
      )}

      {riletturaAttiva && (
        <div style={{ marginTop: 24 }}>
          <button className="btn-secondary" onClick={() => setRiletturaAttiva(false)}>
            Fine rilettura
          </button>
        </div>
      )}
    </div>
  );
}
