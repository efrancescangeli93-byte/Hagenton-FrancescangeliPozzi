package com.hackathon.hagenton.engine;

import java.util.List;

public record SimulationResult(
        List<Movimento> movimenti,
        int saldoFinale,
        int saldoMinimo,
        boolean andatoInRosso,
        int giornoRosso,   // primo giorno in rosso (assoluto), -1 se mai
        String messaggioApertura
) {}
