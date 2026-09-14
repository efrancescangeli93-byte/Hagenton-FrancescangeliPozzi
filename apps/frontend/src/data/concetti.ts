import type { Concetto } from '../types';

export const concetti: Concetto[] = [
  // Finanza (8)
  { id: 'taeg',                  nome: 'TAEG',                    macrotemaId: 'finanza' },
  { id: 'inflazione',            nome: 'Inflazione',              macrotemaId: 'finanza' },
  { id: 'mutuo',                 nome: 'Mutuo',                   macrotemaId: 'finanza' },
  { id: 'interesse-composto',    nome: 'Interesse composto',      macrotemaId: 'finanza' },
  { id: 'franchigia',            nome: 'Franchigia',              macrotemaId: 'finanza' },
  { id: 'spread',                nome: 'Spread',                  macrotemaId: 'finanza' },
  { id: 'rendimento-reale',      nome: 'Rendimento reale',        macrotemaId: 'finanza' },
  { id: 'diversificazione',      nome: 'Diversificazione',        macrotemaId: 'finanza' },

  // Economia (3)
  { id: 'pil',                   nome: 'PIL',                     macrotemaId: 'economia' },
  { id: 'inflazione-core',       nome: 'Inflazione core',         macrotemaId: 'economia' },
  { id: 'tasso-cambio',          nome: 'Tasso di cambio',         macrotemaId: 'economia' },

  // Tecnologia (3)
  { id: 'latenza',               nome: 'Latenza',                 macrotemaId: 'tecnologia' },
  { id: 'crittografia',          nome: 'Crittografia',            macrotemaId: 'tecnologia' },
  { id: 'api',                   nome: 'API',                     macrotemaId: 'tecnologia' },

  // Medicina (2)
  { id: 'pressione-arteriosa',   nome: 'Pressione arteriosa',     macrotemaId: 'medicina' },
  { id: 'indice-massa-corporea', nome: 'Indice di massa corporea',macrotemaId: 'medicina' },

  // Diritto (2)
  { id: 'prescrizione',          nome: 'Prescrizione',            macrotemaId: 'diritto' },
  { id: 'contratto',             nome: 'Contratto',               macrotemaId: 'diritto' },

  // Ambiente (2)
  { id: 'impronta-carbonio',     nome: 'Impronta carbonica',      macrotemaId: 'ambiente' },
  { id: 'biodiversita',          nome: 'Biodiversità',            macrotemaId: 'ambiente' },
];
