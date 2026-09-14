import type { Caso } from './types';

const BASE = 'http://localhost:8080';

/** Chiede al backend (agente "generatore" via Gemini/Claude) un caso completo a 8 slot. */
export async function generaCaso(parola: string): Promise<Caso> {
  const r = await fetch(`${BASE}/api/genera-caso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parola }),
  });
  if (!r.ok) throw new Error('Generazione non riuscita');
  const j = await r.json();
  return {
    id: `gen-${Date.now()}`,
    titolo: j.titolo || 'Caso generato',
    concettoId: j.concetto || 'generato',
    macrotemaId: j.macrotema || undefined,
    tagSecondario: 'generato con AI',
    slot1FattoVissuto: j.fatto || '',
    slot2Trappola: j.trappola || '',
    slot3Spiegazione: j.spiegazione || '',
    slot4Analogia: j.analogia || '',
    slot4Limite: j.limite_analogia || '',
    slot5Numeri: j.numeri || '',
    slot6Termine: j.termine || '',
    slot6Definizione: j.definizione || '',
    slot7Domanda: j.domanda || '',
    slot7Opzioni: Array.isArray(j.opzioni) ? j.opzioni : [],
    slot7Perche: j.perche || j.spiegazione || 'Esatto.',
    slot8CosaFarne: j.cosa_farne || '',
    generato: true,
  };
}
