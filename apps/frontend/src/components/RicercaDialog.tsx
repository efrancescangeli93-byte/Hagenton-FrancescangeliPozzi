import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { concetti } from '../data/concetti';
import { macrotemi } from '../data/macrotemi';
import { useApp } from '../store/AppContext';
import { generaCaso } from '../api';

let setOpenGlobal: ((v: boolean) => void) | null = null;

export function apriRicerca() {
  setOpenGlobal?.(true);
}

export default function RicercaDialog() {
  const [aperto, setAperto] = useState(false);
  const [query, setQuery] = useState('');
  const [generando, setGenerando] = useState(false);
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

  async function genera() {
    const q = query.trim();
    if (!q || generando) return;
    setGenerando(true);
    try {
      const caso = await generaCaso(q); // Gemini identifica l'ambito e crea il caso
      dispatch({ type: 'AGGIUNGI_CASO', payload: caso });
      dispatch({ type: 'SNACKBAR', payload: 'Caso generato' });
      navigate(`/caso/${caso.id}`);
      chiudi();
    } catch {
      dispatch({ type: 'SNACKBAR', payload: 'Generazione non riuscita, riprova' });
    } finally {
      setGenerando(false);
    }
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
            <button className="ricerca-genera" onClick={genera} disabled={generando}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>auto_awesome</span>
              {generando ? 'Genero il caso...' : `Genera un caso su «${query}»`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
