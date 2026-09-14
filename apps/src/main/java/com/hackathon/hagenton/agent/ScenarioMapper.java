package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.hackathon.hagenton.engine.CostoFisso;
import com.hackathon.hagenton.engine.Evento;
import com.hackathon.hagenton.engine.Persona;
import com.hackathon.hagenton.engine.Scenario;
import com.hackathon.hagenton.engine.TipoEvento;

import java.util.ArrayList;
import java.util.List;

/**
 * Converte il JSON prodotto dal Regista nello Scenario del motore.
 * Qui il motore VALIDA e CLAMPA: i numeri restano entro range sicuri,
 * e i costi fissi / saldo iniziale vengono derivati in modo deterministico.
 */
public final class ScenarioMapper {

    private ScenarioMapper() {}

    public static Scenario fromRegista(JsonNode n) {
        JsonNode pj = n.path("persona");
        String nome = pj.path("nome").asText("Persona");
        int stipendio = clamp(pj.path("stipendio").asInt(1200), 800, 2500);
        int giornoStipendio = clamp(pj.path("giorno_stipendio").asInt(27), 1, 28);
        int saldoIniziale = Math.round(stipendio * 0.5f);
        int mesi = clamp(n.path("mesi").asInt(3), 1, 6);

        // Costi fissi derivati (deterministici): affitto proporzionale + bollette + abbonamenti.
        List<CostoFisso> costiFissi = List.of(
                new CostoFisso("Affitto", Math.round(stipendio * 0.4f), 5),
                new CostoFisso("Bollette", 120, 10),
                new CostoFisso("Abbonamenti vari", 40, 12)
        );

        List<Evento> eventi = new ArrayList<>();
        for (JsonNode ev : n.path("eventi")) {
            TipoEvento tipo;
            try {
                tipo = TipoEvento.valueOf(ev.path("tipo").asText("").trim().toUpperCase());
            } catch (Exception e) {
                continue; // tipo non riconosciuto: salta
            }
            int mese = clamp(ev.path("mese").asInt(1), 1, mesi);
            int giorno = ev.path("giorno").asInt(0); // 0 => il motore usa meta' mese
            String etichetta = ev.hasNonNull("etichetta") ? ev.path("etichetta").asText() : null;
            int importo = 0, giorniRitardo = 0, importoMensile = 0;
            switch (tipo) {
                case SPESA_UNA_TANTUM -> importo = clamp(ev.path("importo").asInt(150), 50, 600);
                case AUMENTO_BOLLETTA -> importo = clamp(ev.path("importo").asInt(50), 20, 150);
                case ENTRATA_EXTRA -> importo = clamp(ev.path("importo").asInt(100), 20, 300);
                case ABBONAMENTO_RICORRENTE -> importoMensile = clamp(ev.path("importo_mensile").asInt(10), 5, 50);
                case STIPENDIO_RITARDO -> giorniRitardo = clamp(ev.path("giorni_ritardo").asInt(10), 3, 15);
            }
            eventi.add(new Evento(tipo, mese, giorno, importo, etichetta, giorniRitardo, importoMensile));
        }

        String concetto = n.path("concetto").asText("fondo_emergenza");
        String apertura = n.path("messaggio_apertura").asText("");
        Persona persona = new Persona(nome, stipendio, giornoStipendio, saldoIniziale);
        return new Scenario(concetto, persona, mesi, costiFissi, eventi, apertura);
    }

    private static int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}
