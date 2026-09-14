package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Genera un caso didattico completo (8 slot) a partire da una parola chiave,
 * usando l'agente "generatore" via il provider AI attivo (Gemini o Claude CLI).
 * Fallback deterministico se l'AI non risponde: la feature non si rompe mai.
 */
@RestController
@RequestMapping("/api")
public class GeneraCasoController {

    private static final Logger log = LoggerFactory.getLogger(GeneraCasoController.class);

    private final AgentRunner runner;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeneraCasoController(AgentRunner runner) {
        this.runner = runner;
    }

    public record ParolaReq(String parola) {}

    @PostMapping("/genera-caso")
    public JsonNode genera(@RequestBody ParolaReq req) {
        String parola = req.parola() == null ? "" : req.parola().trim();
        try {
            return runner.runJson("generatore", parola.isBlank() ? "un concetto di finanza personale di base" : parola);
        } catch (Exception e) {
            log.warn("Generatore non disponibile, uso il caso di fallback. ({})", e.getMessage());
            return fallback();
        }
    }

    private JsonNode fallback() {
        try {
            return mapper.readTree("""
                {
                  "macrotema": "finanza",
                  "concetto": "fondo_emergenza",
                  "titolo": "La lavatrice che si rompe a fine mese",
                  "fatto": "Ho 200 euro sul conto e mancano dieci giorni allo stipendio. Stamattina la lavatrice si e' rotta: ripararla costa 300 euro.",
                  "trappola": "Questo mese non avevo spese strane, i conti tornavano. Ma l'imprevisto non era nei conti, e arriva proprio quando non ho margine.",
                  "spiegazione": "Le spese impreviste non chiedono permesso. Se vivi al limite tra entrate e uscite, il primo intoppo ti manda sotto. Un piccolo cuscinetto assorbe il colpo.",
                  "analogia": "E' come la ruota di scorta: non la usi mai per guidare, ma il giorno che buchi ti fa ripartire subito.",
                  "limite_analogia": "A differenza della ruota, il fondo va ricostruito ogni volta che lo usi.",
                  "numeri": "Con 200 euro e una spesa da 300 vai a -100. Con 300 da parte, la stessa spesa non tocca il conto: la copri e resti a galla.",
                  "termine": "Fondo di emergenza",
                  "definizione": "Somma tenuta da parte apposta per coprire spese impreviste senza indebitarsi.",
                  "domanda": "Giulia paga tutte le bollette del mese ma non ha nulla da parte. Le si rompe il telefono (250 euro). Cosa le manca?",
                  "opzioni": [
                    { "testo": "Guadagna troppo poco in assoluto", "corretta": false },
                    { "testo": "Un fondo di emergenza per assorbire l'imprevisto", "corretta": true },
                    { "testo": "Niente, e' solo sfortuna", "corretta": false }
                  ],
                  "cosa_farne": "Dove lo incontri: a ogni spesa non prevista. Cosa guardare: quanti mesi di spese fisse copriresti con quello che hai da parte."
                }
                """);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
