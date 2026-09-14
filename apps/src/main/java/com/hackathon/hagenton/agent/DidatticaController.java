package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Momento didattico: Tutor (copione a 8 slot) e Valutatore (check di trasferimento).
 * Ogni endpoint ha un fallback deterministico: se l'AI non risponde, il gioco continua.
 */
@RestController
@RequestMapping("/api")
public class DidatticaController {

    private static final Logger log = LoggerFactory.getLogger(DidatticaController.class);

    private final AgentRunner runner;

    public DidatticaController(AgentRunner runner) {
        this.runner = runner;
    }

    // ---------- Tutor ----------

    public record TutorRequest(String concetto, String livello, String numeri) {}

    public record Copione(String trappola, String spiegazione, String analogia, String limiteAnalogia,
                          String numeri, String termine, String definizione, String cosaFarne) {}

    @PostMapping("/tutor")
    public Copione tutor(@RequestBody TutorRequest r) {
        String input = "concetto: " + nz(r.concetto())
                + "\nlivello_utente: " + livello(r.livello())
                + "\nnumeri: " + nz(r.numeri());
        try {
            JsonNode j = runner.runJson("tutor", input);
            return new Copione(
                    txt(j, "trappola"), txt(j, "spiegazione"), txt(j, "analogia"), txt(j, "limite_analogia"),
                    txt(j, "numeri"), txt(j, "termine"), txt(j, "definizione"), txt(j, "cosa_farne"));
        } catch (Exception e) {
            log.warn("Tutor non disponibile, uso il copione di fallback. ({})", e.getMessage());
            return fallbackCopione();
        }
    }

    // ---------- Valutatore (check) ----------

    public record CheckRequest(String concetto, String livello, String domanda, String risposta) {}

    public record Domanda(String domanda, String caso) {}

    public record Valutazione(int punteggio, boolean padroneggiato, String lacuna, String feedback, String prossimaDomanda) {}

    @PostMapping("/check/domanda")
    public Domanda generaDomanda(@RequestBody CheckRequest r) {
        String input = "modalita: genera_domanda\nconcetto: " + nz(r.concetto())
                + "\nlivello_utente: " + livello(r.livello());
        try {
            JsonNode j = runner.runJson("valutatore", input);
            return new Domanda(txt(j, "domanda"), txt(j, "caso"));
        } catch (Exception e) {
            log.warn("Valutatore (domanda) non disponibile, uso fallback. ({})", e.getMessage());
            return new Domanda(
                    "A un tuo amico si rompe il telefono e deve spendere 250 euro all'improvviso. "
                            + "Cosa gli permette di affrontarlo senza finire in rosso?",
                    "caso nuovo: spesa imprevista di 250 euro");
        }
    }

    @PostMapping("/check/valuta")
    public Valutazione valuta(@RequestBody CheckRequest r) {
        String input = "modalita: valuta\nconcetto: " + nz(r.concetto())
                + "\nlivello_utente: " + livello(r.livello())
                + "\ndomanda: " + nz(r.domanda())
                + "\nrisposta utente: " + nz(r.risposta());
        try {
            JsonNode j = runner.runJson("valutatore", input);
            String next = j.path("prossima_domanda").isNull() ? null : txt(j, "prossima_domanda");
            return new Valutazione(
                    j.path("punteggio").asInt(0), j.path("padroneggiato").asBoolean(false),
                    txt(j, "lacuna"), txt(j, "feedback"), next);
        } catch (Exception e) {
            log.warn("Valutatore (valuta) non disponibile, uso fallback. ({})", e.getMessage());
            return new Valutazione(0, false, "",
                    "Non sono riuscito a valutare la risposta in questo momento. Riprova.", null);
        }
    }

    // ---------- helper ----------

    private static String txt(JsonNode j, String field) {
        return j.path(field).asText("");
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static String livello(String s) {
        return "avanzato".equalsIgnoreCase(s) ? "avanzato" : "base";
    }

    private static Copione fallbackCopione() {
        return new Copione(
                "Spesso si pensa che basti guadagnare abbastanza per stare tranquilli.",
                "Contano anche quando entrano ed escono i soldi, e cosa succede se arriva un imprevisto.",
                "E' come una barca: non conta solo quanta acqua entra, ma anche se hai un secchio per svuotarla quando arriva un'onda.",
                "L'analogia non regge del tutto: i soldi, a differenza dell'acqua, puoi programmarli in anticipo.",
                "Con un piccolo margine da parte, una spesa da qualche centinaio di euro non ti manda sotto zero.",
                "cuscinetto / fondo di emergenza",
                "Una somma tenuta da parte apposta per coprire spese impreviste senza andare in difficolta'.",
                "Lo incontri a ogni spesa non prevista: guarda quanto margine hai prima che il conto vada in rosso.");
    }
}
