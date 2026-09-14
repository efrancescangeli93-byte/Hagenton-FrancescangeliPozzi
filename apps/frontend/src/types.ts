export type Macrotema = {
  id: string;
  nome: string;
  colore: string;
  testoSuColore: string;
  tinta: string;
  ordine: number;
};

export type Concetto = {
  id: string;
  nome: string;
  macrotemaId: string;
};

export type Caso = {
  id: string;
  titolo: string;
  concettoId: string;
  tagSecondario: string;
  slot1FattoVissuto: string;
  slot2Trappola: string;
  slot3Spiegazione: string;
  slot4Analogia: string;
  slot4Limite: string;
  slot5Numeri: string;
  slot6Termine: string;
  slot6Definizione: string;
  slot7Domanda: string;
  slot7Opzioni: { testo: string; corretta: boolean }[];
  slot7Perche: string;
  slot8CosaFarne: string;
  concettoCollegatoId?: string;
  generato: boolean;
};

export type Risultato = {
  casoId: string;
  punteggio: number;
  tentativi: number;
  data: string;
};
