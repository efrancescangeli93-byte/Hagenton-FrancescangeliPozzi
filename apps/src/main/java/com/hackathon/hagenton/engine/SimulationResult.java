package com.hackathon.hagenton.engine;

import java.util.List;

public record SimulationResult(
        List<Movimento> movimenti,
        int saldoFinale,
        int saldoMinimo,
        boolean andatoInRosso,
        int giornoRosso,            // primo giorno in rosso (assoluto), -1 se mai
        int cuscinettoIniziale,
        int cuscinettoFinale,
        int cuscinettoUsato,
        boolean salvatoDalCuscinetto, // senza cuscinetto saresti andato in rosso, con esso no
        String messaggioApertura
) {}
