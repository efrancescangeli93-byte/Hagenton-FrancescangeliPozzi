package com.hackathon.hagenton.engine;

/** La scelta dell'utente per un evento (identificato dal suo indice nello scenario). */
public record Decisione(int eventoIndex, Azione azione) {}
