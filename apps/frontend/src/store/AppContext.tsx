import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Caso, Risultato } from '../types';
import { risultatiSeed } from '../data/risultatiSeed';

type State = {
  risultati: Risultato[];
  casiGenerati: Caso[];
  snackbar: string | null;
};

type Action =
  | { type: 'SALVA_RISULTATO'; payload: Risultato }
  | { type: 'AGGIUNGI_CASO'; payload: Caso }
  | { type: 'SNACKBAR'; payload: string | null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SALVA_RISULTATO': {
      const esistente = state.risultati.findIndex(r => r.casoId === action.payload.casoId);
      if (esistente >= 0) {
        const aggiornati = [...state.risultati];
        aggiornati[esistente] = action.payload;
        return { ...state, risultati: aggiornati };
      }
      return { ...state, risultati: [...state.risultati, action.payload] };
    }
    case 'AGGIUNGI_CASO':
      return { ...state, casiGenerati: [...state.casiGenerati, action.payload] };
    case 'SNACKBAR':
      return { ...state, snackbar: action.payload };
    default:
      return state;
  }
}

const LS_KEY = 'ahEccoState';

function caricaDaLS(): Partial<State> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

export const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> }>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = caricaDaLS();
  const [state, dispatch] = useReducer(reducer, {
    risultati: saved.risultati ?? risultatiSeed,
    casiGenerati: saved.casiGenerati ?? [],
    snackbar: null,
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ risultati: state.risultati, casiGenerati: state.casiGenerati })
      );
    } catch {
      // ignore storage errors
    }
  }, [state.risultati, state.casiGenerati]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
