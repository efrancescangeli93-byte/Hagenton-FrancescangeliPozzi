# Piano di test — "Ah, ecco!"

Guida per provare tutte le funzionalità (backend + frontend) prima della demo.
Legenda esito: [ ] da fare · [x] ok · [!] problema.

---

## 0. Avvio

### Backend (Spring Boot, porta 8080)
Dalla cartella `apps/`:

- **Con Claude (sottoscrizione, nessuna key):**
  ```
  mvn spring-boot:run
  ```
- **Con Gemini (API free, portabile):** imposta la chiave e avvia con il provider gemini:
  ```
  set GEMINI_API_KEY=la-tua-chiave        (PowerShell: $env:GEMINI_API_KEY="la-tua-chiave")
  java -jar target/hagenton-0.0.1-SNAPSHOT.jar --llm.provider=gemini
  ```
  (in alternativa: `llm.provider=gemini` in `application.properties`)

### Frontend (Vite, porta 5173)
Dalla cartella `apps/frontend/`:
```
npm install      (solo la prima volta)
npm run dev
```
Apri http://localhost:5173/

---

## 1. Test automatici (backend)

Dalla cartella `apps/`:
```
mvn test
```
- [ ] Esito atteso: **BUILD SUCCESS**, `Tests run: 11, Failures: 0, Errors: 0`
- Coprono: motore di simulazione, mapper dello scenario, estrazione JSON degli agenti.

---

## 2. Test API backend (curl)

> Sostituisci le parole a piacere. La generazione usa il provider AI attivo.

| # | Comando | Atteso |
|---|---|---|
| 2.1 | `curl "http://localhost:8080/api/simula/demo?cuscinetto=0"` | JSON deterministico, `resilienceScore` presente |
| 2.2 | `curl -X POST http://localhost:8080/api/genera-caso -H "Content-Type: application/json" -d "{\"parola\":\"IRPEF\"}"` | **HTTP 200**, `macrotema` valido + 8 slot |
| 2.3 | `curl -X POST http://localhost:8080/api/genera-caso -H "Content-Type: application/json" -d "{\"parola\":\"vaccino\"}"` | **HTTP 200**, `macrotema: medicina` |
| 2.4 | `curl -i -X POST http://localhost:8080/api/genera-caso -H "Content-Type: application/json" -d "{\"parola\":\"ricetta della carbonara\"}"` | **HTTP 422**, `{"error": "...non rientra..."}` |
| 2.5 | `curl -X POST http://localhost:8080/api/tutor -H "Content-Type: application/json" -d "{\"concetto\":\"fondo_emergenza\",\"livello\":\"base\",\"numeri\":\"saldo 200, spesa 350\"}"` | JSON con trappola, analogia, limite, termine, cosa_farne |
| 2.6 | `curl -X POST http://localhost:8080/api/check/domanda -H "Content-Type: application/json" -d "{\"concetto\":\"liquidita_vs_solvibilita\",\"livello\":\"base\"}"` | JSON con `domanda` di trasferimento su caso nuovo |

- [ ] 2.1  [ ] 2.2  [ ] 2.3  [ ] 2.4  [ ] 2.5  [ ] 2.6

---

## 3. Frontend — Home

| # | Passi | Atteso |
|---|---|---|
| 3.1 | Apri la Home | 6 bolle macrotemi, griglia ordinata e centrata (neutra/grigia) |
| 3.2 | Guarda le bolle | **Galleggiano** leggermente, in modo sfalsato |
| 3.3 | Passa il mouse su una bolla | **Si ingrandisce** (prima del click); il galleggiamento si ferma |
| 3.4 | Clic su **Finanza** | Va al tema con tinta gialla |
| 3.5 | Restringi la finestra (mobile) | Nav in basso, 1 colonna, niente scroll orizzontale |

- [ ] 3.1  [ ] 3.2  [ ] 3.3  [ ] 3.4  [ ] 3.5

---

## 4. Frontend — Ricerca globale (flat, tutti gli ambiti)

| # | Passi | Atteso |
|---|---|---|
| 4.1 | Premi `/` o `Ctrl/Cmd+K` | Si apre la ricerca (grigia) |
| 4.2 | Scrivi "vaccino" → **Genera un caso** | Genera e apre un caso in **medicina** (tinta rosa) |
| 4.3 | Scrivi "spread" → Genera | Caso in **finanza/economia** |
| 4.4 | Scrivi "ricetta carbonara" → Genera | **Errore** (snackbar): non rientra negli argomenti |
| 4.5 | `Esc` | Chiude la ricerca |

- [ ] 4.1  [ ] 4.2  [ ] 4.3  [ ] 4.4  [ ] 4.5

---

## 5. Frontend — Tema Finanza (generazione dedicata)

| # | Passi | Atteso |
|---|---|---|
| 5.1 | In Finanza c'è il box "Non trovi il concetto?" | Input + bottone "Genera un caso" |
| 5.2 | Scrivi "cashback" → Genera | Apre un caso di finanza a 8 slot |
| 5.3 | Scrivi qualcosa fuori tema | Messaggio d'errore sotto il box |

- [ ] 5.1  [ ] 5.2  [ ] 5.3

---

## 6. Frontend — Caso (cuore, logica 8 slot)

| # | Passi | Atteso |
|---|---|---|
| 6.1 | Apri un caso | Solo slot 1 visibile, "Prosegui", "1 di 8" |
| 6.2 | Premi "Prosegui" fino al check | Slot 1→6 appaiono in sequenza (i letti restano sbiaditi) |
| 6.3 | Slot 7: "Conferma" senza selezionare | Errore inline, nessun avanzamento |
| 6.4 | Rispondi **sbagliato** | Opzione rossa + riquadro che cita la trappola; puoi riprovare |
| 6.5 | Rispondi **giusto** al 1° tentativo | Verde + spiegazione + **100 punti**; si sblocca slot 8 |
| 6.6 | (altro caso) giusto al 2°/3° tentativo | Punteggio **60 / 40** |
| 6.7 | Riapri un caso completato | Tutti gli 8 slot + chip punteggio + "Rileggi passo a passo" |
| 6.8 | Slot 8 | "Cosa guardare" (mai "cosa scegliere") |

- [ ] 6.1  [ ] 6.2  [ ] 6.3  [ ] 6.4  [ ] 6.5  [ ] 6.6  [ ] 6.7  [ ] 6.8

---

## 7. Frontend — Progressi (da zero a ogni run)

| # | Passi | Atteso |
|---|---|---|
| 7.1 | Apri Progressi appena avviata l'app | Radar **vuoto/a zero**, "—" ovunque |
| 7.2 | Completa 1-2 casi, torna in Progressi | Il radar e i punteggi si **aggiornano** sugli ambiti giusti |
| 7.3 | Ricarica la pagina (F5) | Riparte **da zero** (nuovo "utente") |
| 7.4 | Vista Macrotemi / Concetti | Il toggle cambia l'elenco |

- [ ] 7.1  [ ] 7.2  [ ] 7.3  [ ] 7.4

---

## 8. Trasversali (qualità / vincoli)

| # | Cosa | Atteso |
|---|---|---|
| 8.1 | Menu | Solo **Temi** e **Progressi** |
| 8.2 | No-advice | Da nessuna parte si dice cosa comprare/scegliere/investire |
| 8.3 | Stile | Niente emoji, ombre, gradienti; sentence case |
| 8.4 | Robustezza | Se il backend è spento, la generazione mostra un errore gestito (l'app non crasha) |
| 8.5 | Accessibilità | Navigazione da tastiera, focus visibile sulle bolle |

- [ ] 8.1  [ ] 8.2  [ ] 8.3  [ ] 8.4  [ ] 8.5

---

## Note per la demo
- Percorso d'oro: **Home → Finanza → apri un caso → arriva al check → rispondi → Progressi si aggiorna**.
- Wow: **ricerca globale** con una parola qualsiasi (vaccino, spread, contratto) → caso generato dall'AI nell'ambito giusto.
