package com.hackathon.hagenton.engine;

import java.util.List;

public record Scenario(
        String concetto,
        Persona persona,
        int mesi,
        List<CostoFisso> costiFissi,
        List<Evento> eventi,
        String messaggioApertura
) {}
