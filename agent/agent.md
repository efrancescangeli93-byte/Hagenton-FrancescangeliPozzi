# Struttura agentica

Questa cartella definisce il "cervello" dell'agente. L'applicazione in `../apps`
lo carica a runtime: separando l'agente dal software, si puo' iterare sul
comportamento senza toccare il codice.

## Componenti

- **`system-prompt.txt`** — le istruzioni dell'agente (persona, regole, tono).
  L'app lo rilegge a ogni richiesta: puoi modificarlo e la modifica ha effetto
  al messaggio successivo, senza riavviare.

## Come funziona (runtime)

```
Browser ──> Spring Boot (/api/chat) ──> claude CLI (headless) ──> Claude
              usa system-prompt.txt          sottoscrizione, no API key
```

- **Modello:** configurabile in `../apps/src/main/resources/application.properties`
  (`claude.model` = `sonnet` veloce / `opus` piu' capace).
- **Autenticazione:** la CLI `claude` usa la sottoscrizione con cui si e' loggati
  in Claude Code. Nessuna API key.
- **Memoria conversazionale:** ogni risposta restituisce un `session_id` che il
  client rimanda indietro; l'agente riprende il contesto via `--resume`.

## Poteri dell'agente (tool) — opzionale

La CLI puo' dare all'agente strumenti reali (lettura file, ricerca web, ecc.).
Di default sono disattivati (chat pura). Per abilitarli si aggiungono i flag
`--allowedTools` alla chiamata in `ClaudeService`.

## Specializzazione per il tema

Quando il tema e' deciso, si aggiorna la sezione finale di `system-prompt.txt`
con il ruolo specifico (es. "spiega documenti finanziari in linguaggio semplice").
