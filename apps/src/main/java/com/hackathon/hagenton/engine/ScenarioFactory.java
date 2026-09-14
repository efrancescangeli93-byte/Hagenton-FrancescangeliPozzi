package com.hackathon.hagenton.engine;

import java.util.List;

/** Scenari pre-scritti (libreria di casi), usati per la demo e come fallback. */
public final class ScenarioFactory {

    private ScenarioFactory() {}

    public static Scenario demoLiquidita() {
        Persona luca = new Persona("Luca", 1400, 27, 900);
        List<CostoFisso> fissi = List.of(
                new CostoFisso("Affitto", 600, 5),
                new CostoFisso("Bollette", 120, 10),
                new CostoFisso("Abbonamenti vari", 40, 12)
        );
        List<Evento> eventi = List.of(
                new Evento(TipoEvento.SPESA_UNA_TANTUM, 1, 15, 300, "Lavatrice rotta", 0, 0),
                new Evento(TipoEvento.STIPENDIO_RITARDO, 2, 0, 0, "Stipendio in ritardo", 10, 0)
        );
        return new Scenario(
                "liquidita_vs_solvibilita", luca, 3, fissi, eventi,
                "Luca guadagna abbastanza per pagare tutto. Ma i soldi arrivano sempre al momento giusto?"
        );
    }
}
