# Struttura agentica — "Fine Mese"

Questa cartella definisce il "cervello" del prodotto. Il software in `../apps`
carica queste definizioni a runtime.

## Principio guida
**Gli AGENTI gestiscono le PAROLE e la PEDAGOGIA. Il MOTORE deterministico (Java)
gestisce i SOLDI.**
- Robustezza: i numeri (saldo, score, conseguenze) non dipendono mai da un LLM → la demo non si rompe.
- No-advice by design: un agente non decide mai un esito o una scelta finanziaria.

## Il flusso (dalla parola chiave)
```
PAROLA CHIAVE → REGISTA → (JSON scenario) → MOTORE valida & clampa & costruisce
                                                   │
                       per ogni evento: NARRATORE → [scelta utente] → TUTOR → VALUTATORE
```
1. L'utente scrive una **parola chiave** (una preoccupazione o un termine sui soldi di tutti i giorni).
2. Il **Regista** interpreta la parola e compone uno scenario **strutturato** (JSON).
3. Il **Motore** valida e "clampa" i numeri entro range sicuri, poi costruisce il caso.
4. Per ogni evento: il **Narratore** racconta, l'utente sceglie, il motore calcola le conseguenze, il **Tutor** spiega, il **Valutatore** misura.

In alternativa alla parola chiave, si usano i **casi pre-scritti** (libreria di imprevisti):
stesso motore, stessi 3 agenti a valle.

## Gli agenti (4)
| File | Agente | Ruolo | Output |
|---|---|---|---|
| `regista.txt` | Regista | da parola chiave → scenario strutturato | JSON |
| `narratore.txt` | Narratore | racconta l'evento (parole) | testo |
| `tutor.txt` | Tutor | spiega il concetto al livello dell'utente | JSON |
| `valutatore.txt` | Valutatore | misura la comprensione e adatta la difficolta' | JSON |

L'**orchestratore non e' un agente**: e' il motore di gioco deterministico, che decide
QUANDO invocare ciascun agente e possiede la verita' sui numeri.

## Copione didattico (8 slot)
Ogni concetto viene insegnato con questo copione, a rivelazione progressiva (non tutto insieme):

| # | Slot | Chi | Note |
|---|---|---|---|
| 1 | Fatto vissuto | Narratore | l'evento appena giocato, prima persona, 2 righe |
| 2 | La trappola | Tutor | il ragionamento intuitivo e sbagliato ("predici → scopri") |
| 3 | Spiegazione | Tutor | il meccanismo, zero gergo |
| 4 | Analogia + limite | Tutor | la forma del concetto, e dove NON regge |
| 5 | I numeri | Tutor | mini-caso quantificato (numeri dal motore) |
| 6 | Termine tecnico | Tutor | etichetta + definizione formale |
| 7 | Check | Valutatore | domanda di **trasferimento** su un caso NUOVO |
| 8 | Cosa farne | Tutor | dove lo incontri, **cosa guardare** (mai cosa scegliere) |

## Contratti JSON (sintesi)
- **Regista →** `{ concetto, persona{nome,stipendio,giorno_stipendio}, mesi, eventi[], messaggio_apertura }` *(può arrivare tra fence ```json — il motore li rimuove)*
- **Narratore →** testo semplice (2-3 frasi)
- **Tutor →** `{ trappola, spiegazione, analogia, limite_analogia, numeri, termine, definizione, cosa_farne }`
- **Valutatore →** genera_domanda: `{ domanda, caso }` · valuta: `{ punteggio(0-5), padroneggiato, lacuna, feedback, prossima_domanda }`

## Fallback (robustezza demo)
Ogni agente ha un fallback deterministico → se l'LLM non risponde, il gioco continua:
- Regista → seleziona il caso piu' vicino dalla libreria pre-scritta.
- Narratore → copy pre-scritta dell'evento.
- Tutor → spiegazione base fissa del concetto.
- Valutatore → quiz a scelta multipla con correzione fissa.

## Modello / autenticazione
Gli agenti girano su Claude via CLI (sottoscrizione, nessuna API key), modello
configurabile in `../apps/src/main/resources/application.properties`.

> Nota: `system-prompt.txt` e' il prompt singolo usato dalla chat demo iniziale;
> verra' superato quando il motore cablera' i 4 agenti qui sopra.
