package com.hackathon.hagenton.engine;

/**
 * Un evento del gioco. A seconda del tipo, sono valorizzati campi diversi:
 * - SPESA_UNA_TANTUM / AUMENTO_BOLLETTA / ENTRATA_EXTRA -> importo, etichetta
 * - STIPENDIO_RITARDO -> giorniRitardo
 * - ABBONAMENTO_RICORRENTE -> importoMensile, etichetta (ricorre dal suo mese in poi)
 * giorno = giorno del mese (1-30); se 0, default a meta' mese.
 */
public record Evento(
        TipoEvento tipo,
        int mese,
        int giorno,
        int importo,
        String etichetta,
        int giorniRitardo,
        int importoMensile
) {}
