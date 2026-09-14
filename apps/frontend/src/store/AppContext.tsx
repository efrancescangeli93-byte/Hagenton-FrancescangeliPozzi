import React, { createContext, useContext, useReducer } from 'react';
import type { Caso, Risultato } from '../types';

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

export const AppContext = createContext<{ state: State; dispatch: React.Dispatch<Action> }>(null!);

/**
 * Stato in memoria: ogni avvio dell'app parte da ZERO (un "utente" = un run).
 * I progressi si costruiscono solo con i casi completati durante il run.
 * (La profilazione persistente e' un'evoluzione futura.)
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    risultati: [],
    casiGenerati: [],
    snackbar: null,
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
