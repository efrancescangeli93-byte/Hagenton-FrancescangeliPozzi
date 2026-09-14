import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { macrotemi } from './data/macrotemi';
import { concetti } from './data/concetti';
import { casi } from './data/casi';
import Navigazione from './components/Navigazione';
import RicercaDialog from './components/RicercaDialog';
import Home from './pages/Home';
import Tema from './pages/Tema';
import Casi from './pages/Casi';
import Caso from './pages/Caso';
import Progressi from './pages/Progressi';
import { useEffect, useRef } from 'react';

function Snackbar() {
  const { state, dispatch } = useApp();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.snackbar) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        dispatch({ type: 'SNACKBAR', payload: null });
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.snackbar]);

  if (!state.snackbar) return null;
  return (
    <div className="snackbar" role="status" aria-live="polite">
      {state.snackbar}
    </div>
  );
}

function TintaWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { state } = useApp();

  // Estrai macrotemaId dall'URL
  const macrotemaMatch = location.pathname.match(/\/tema\/([^/]+)/);
  const macrotemaIdFromUrl = macrotemaMatch?.[1];

  // Per /caso/:casoId → cerca il macrotema tramite il concetto del caso
  const casoMatch = location.pathname.match(/\/caso\/([^/]+)/);
  const casoId = casoMatch?.[1];

  let tinta = 'neutro';

  if (macrotemaIdFromUrl) {
    const tema = macrotemi.find(m => m.id === macrotemaIdFromUrl);
    tinta = tema?.tinta ?? 'neutro';
  } else if (casoId) {
    const tuttiCasi = [...casi, ...state.casiGenerati];
    const caso = tuttiCasi.find(c => c.id === casoId);
    if (caso) {
      const concetto = concetti.find(c => c.id === caso.concettoId);
      if (concetto) {
        const tema = macrotemi.find(m => m.id === concetto.macrotemaId);
        tinta = tema?.tinta ?? 'neutro';
      }
    }
  }

  return (
    <div data-tinta={tinta} className="app-wrapper">
      {children}
    </div>
  );
}

function InnerApp() {
  return (
    <TintaWrapper>
      <Navigazione />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tema/:macrotemaId" element={<Tema />} />
          <Route path="/tema/:macrotemaId/concetto/:concettoId" element={<Casi />} />
          <Route path="/caso/:casoId" element={<Caso />} />
          <Route path="/progressi" element={<Progressi />} />
        </Routes>
      </main>
      <RicercaDialog />
      <Snackbar />
    </TintaWrapper>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </HashRouter>
  );
}
