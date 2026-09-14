import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { concetti } from '../data/concetti';
import { macrotemi } from '../data/macrotemi';
import { useApp } from '../store/AppContext';
import type { Caso } from '../types';

let setOpenGlobal: ((v: boolean) => void) | null = null;

export function apriRicerca() {
  setOpenGlobal?.(true);
}

export default function RicercaDialog() {
  const [aperto, setAperto] = useState(false);
  const [query, setQuery] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenGlobal = setAperto;
    return () => { setOpenGlobal = null; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === '/' && !isInputFocused()) || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        setAperto(true);
      }
      if (e.key === 'Escape' && aperto) {
        chiudi();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aperto]);

  useEffect(() => {
    if (aperto) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aperto]);

  useEffect(() => {
    if (!aperto) return;
    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener('keydown', onTab);
    return () => window.removeEventListener('keydown', onTab);
  }, [aperto]);

  function isInputFocused(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  }

  function chiudi() {
    setAperto(false);
    setQuery('');
    setTimeout(() => triggerRef.current?.focus(), 50);
  }

  const risultati = query.length > 0
    ? concetti.filter(c =>
        c.nome.toLowerCase().includes(query.toLowerCase()) ||
        c.id.includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  function vaiAConcetto(concettoId: string) {
    const c = concetti.find(x => x.id === concettoId)!;
    navigate(`/tema/${c.macrotemaId}/concetto/${c.id}`);
    chiudi();
  }

  function genera() {
    if (!query.trim()) return;
    const tsId = Date.now();
    const id = `generato-${tsId}`;

    const concettoTrovato = risultati[0];
    const concettoId = concettoTrovato?.id ?? query.toLowerCase().replace(/\s+/g, '-');

    const caso: Caso = {
      id,
      titolo: `Caso su "${query}"`,
      concettoId,
      tagSecondario: 'Generato',
      slot1FattoVissuto: `Slot 1 — il fatto vissuto su "${query}": da compilare.`,
      slot2Trappola: `Slot 2 — il ragionamento intuitivo su "${query}": da compilare.`,
      slot3Spiegazione: `Slot 3 — la spiegazione di "${query}": da compilare.`,
      slot4Analogia: `Slot 4 — l'analogia per "${query}": da compilare.`,
      slot4Limite: `Slot 4 — il limite dell'analogia: da compilare.`,
      slot5Numeri: `Slot 5 — i numeri per "${query}": da compilare.`,
      slot6Termine: `${query} — termine tecnico.`,
      slot6Definizione: `Slot 6 — la definizione formale di "${query}": da compilare.`,
      slot7Domanda: `Slot 7 — domanda di trasferimento su "${query}": da compilare.`,
      slot7Opzioni: [
        { testo: 'Opzione A (corretta): da compilare', corretta: true },
        { testo: 'Opzione B: da compilare', corretta: false },
        { testo: 'Opzione C: da compilare', corretta: false },
      ],
      slot7Perche: `Slot 7 — spiegazione della risposta corretta: da compilare.`,
      slot8CosaFarne: `Slot 8 — cosa guardare per "${query}": da compilare.`,
      generato: true,
    };

    dispatch({ type: 'AGGIUNGI_CASO', payload: caso });
    dispatch({ type: 'SNACKBAR', payload: 'Caso generato' });
    navigate(`/caso/${id}`);
    chiudi();
  }

  if (!aperto) return null;

  return (
    <div
      className="ricerca-overlay"
      onClick={e => { if (e.target === e.currentTarget) chiudi(); }}
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Cerca un concetto"
        className="ricerca-dialog"
      >
        <input
          ref={inputRef}
          className="ricerca-input"
          placeholder="Cerca un concetto..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && risultati.length > 0) vaiAConcetto(risultati[0].id); }}
          aria-autocomplete="list"
          aria-controls="ricerca-risultati"
        />

        {risultati.length > 0 && (
          <>
            <div className="ricerca-divider" />
            <div id="ricerca-risultati" role="listbox">
              {risultati.map(c => {
                const tema = macrotemi.find(m => m.id === c.macrotemaId);
                return (
                  <div
                    key={c.id}
                    role="option"
                    aria-selected={false}
                    className="ricerca-risultato"
                    onClick={() => vaiAConcetto(c.id)}
                    onKeyDown={e => { if (e.key === 'Enter') vaiAConcetto(c.id); }}
                    tabIndex={0}
                  >
                    <span>{c.nome}</span>
                    <span className="ricerca-tag">{tema?.nome}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {query.trim().length > 0 && (
          <>
            <div className="ricerca-divider" />
            <button className="ricerca-genera" onClick={genera}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>auto_awesome</span>
              Genera un caso su «{query}»
            </button>
          </>
        )}
      </div>
    </div>
  );
}
