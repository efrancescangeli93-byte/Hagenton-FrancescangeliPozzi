import type { Caso } from './types';

// Il backend gira in locale (la giuria lo avvia sulla propria macchina).
const BASE = 'http://localhost:8080';
const TIMEOUT_MS = 60000;

/** Chiede al backend (agente "generatore" via Gemini/Claude) un caso completo a 8 slot. */
export async function generaCaso(parola: string): Promise<Caso> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${BASE}/api/genera-caso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parola }),
      signal: ctrl.signal,
    });

    // Leggo sempre il corpo (coperto dal timeout finche' non svuoto clearTimeout).
    const testo = await r.text();
    let j: any = null;
    try {
      j = testo ? JSON.parse(testo) : null;
    } catch {
      j = null;
    }

    if (!r.ok) {
      throw new Error((j && j.error) || 'Generazione non riuscita. Riprova.');
    }
    if (!j) {
      throw new Error('Risposta non valida dal server. Riprova.');
    }

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
      spiegazioneErrore: j.spiegazione_errore || undefined,
      slot8CosaFarne: j.cosa_farne || '',
      generato: true,
    };
  } catch (e) {
    if (ctrl.signal.aborted) {
      throw new Error('La generazione ha impiegato troppo tempo. Riprova.');
    }
    if (e instanceof TypeError) {
      throw new Error('Backend non raggiungibile. Verifica che sia avviato.');
    }
    throw e; // messaggi gia' amichevoli sollevati sopra
  } finally {
    clearTimeout(timer);
  }
}
