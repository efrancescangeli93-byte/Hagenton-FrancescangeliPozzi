package com.hackathon.hagenton.engine;

/** Una riga del registro: cosa e' successo, quando, e il saldo risultante. */
public record Movimento(int giorno, int mese, String etichetta, int importo, int saldoDopo) {}
