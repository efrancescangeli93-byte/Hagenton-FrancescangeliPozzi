# Ah, ecco!

**Capire, non memorizzare.** Un'app che insegna concetti di base (finanza personale e non solo)
partendo da un **fatto vissuto** e rivelando il termine tecnico solo alla fine.

Progetto per l'hackathon AI — traccia **Inclusione finanziaria**. Team Francescangeli & Pozzi.

---

## L'idea in breve

Le parole difficili (TAEG, inflazione, liquidità, fondo di emergenza…) allontanano chi ha bassa
alfabetizzazione finanziaria. "Ah, ecco!" le fa **capire** con un percorso a **8 slot**:

1. **Fatto vissuto** — un fatto quotidiano concreto
2. **La trappola** — il ragionamento intuitivo e sbagliato
3. **Spiegazione** — il meccanismo, senza gergo
4. **Analogia + limite** — un'immagine e dove non regge
5. **I numeri** — un mini-caso quantificato
6. **Termine tecnico** — l'etichetta e la definizione
7. **Check** — una domanda di *trasferimento* su un caso nuovo (con feedback chiaro su giusto/sbagliato)
8. **Cosa farne** — dove lo incontri e *cosa guardare* (mai *cosa scegliere*)

Il **check di trasferimento** misura il miglioramento della comprensione. La **Finanza** è il tema
completo; gli altri ambiti (economia, tecnologia, medicina, diritto, ambiente) sono estendibili.

---

## Struttura del progetto

```
apps/            software
  ├── (Spring Boot)   backend: motore + agenti  (apps/pom.xml, apps/src)
  └── frontend/       frontend: Vite + React + TypeScript
agent/           il "cervello": prompt degli agenti runtime (+ skills/ di sviluppo)
presentazione/   pitch HTML brandizzato
```

---

## Come si avvia (in locale)

**Requisiti:** JDK, Node.js. Per l'AI a runtime: la CLI `claude` loggata (sottoscrizione) **oppure**
una chiave gratuita Google Gemini.

### Backend (porta 8080) — dalla cartella `apps/`
- Con **Claude** (sottoscrizione, nessuna key):
  ```
  mvn spring-boot:run
  ```
- Con **Gemini** (API free, portabile):
  ```
  # PowerShell:  $env:GEMINI_API_KEY="la-tua-chiave"
  java -jar target/hagenton-0.0.1-SNAPSHOT.jar --llm.provider=gemini
  ```
  (chiave gratuita da https://aistudio.google.com — modello di default `gemini-3.5-flash-lite`)

### Frontend (porta 5173) — dalla cartella `apps/frontend/`
```
npm install        # solo la prima volta
npm run dev
```
Apri **http://localhost:5173/**

---

## Architettura

- **Frontend** React/TS (HashRouter, stato in memoria): un run = un utente, i progressi si costruiscono
  da zero con i casi completati.
- **Backend** Spring Boot. Astrazione **`LlmProvider`** con due implementazioni intercambiabili:
  `claude-cli` (default) e `gemini` (via `llm.provider`).
- **Principio guida:** le *parole* agli agenti, i *numeri* al **motore deterministico** → niente si
  rompe e nessun consiglio finanziario.
- **Agenti** (in `agent/`): `regista` (parola → scenario), `narratore`, `tutor` (copione 8 slot),
  `valutatore` (check), `generatore` (caso completo da una parola/frase, identificando l'ambito).
- **Fallback ed errori gestiti:** se l'AI non risponde l'utente riceve un errore chiaro, mai un caso finto.

### Endpoint principali
- `POST /api/genera-caso` — parola/frase → caso a 8 slot (o **422** se fuori ambito, **503** se l'AI è giù)
- `GET /api/simula/demo`, `POST /api/simula` — motore di simulazione deterministico
- `POST /api/tutor`, `POST /api/check/domanda`, `POST /api/check/valuta`

---

## Testing

- Unit test del cuore deterministico: dalla cartella `apps/` → `mvn test` (11 test).
- Piano di test manuale completo: vedi **[TEST.md](TEST.md)**.

---

## Note

- **Agentic coding:** costruito con Claude Code. Gli agenti di sviluppo sono in `agent/skills/`,
  quelli di runtime in `agent/`.
- **Quota Gemini:** il free tier è limitato; in demo bastano poche generazioni, per il resto usa i
  casi pre-caricati.
- **No-advice:** l'app educa, non consiglia — mai indicazioni su cosa comprare, vendere o scegliere.
