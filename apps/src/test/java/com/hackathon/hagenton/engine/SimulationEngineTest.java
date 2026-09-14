package com.hackathon.hagenton.engine;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SimulationEngineTest {

    private final SimulationEngine engine = new SimulationEngine();

    private List<Decisione> usaCuscinettoSulloShock() {
        return List.of(new Decisione(0, Azione.USA_CUSCINETTO));
    }

    @Test
    void senzaCuscinetto_vaInRosso() {
        SimulationResult r = engine.simula(ScenarioFactory.demoLiquidita());
        assertTrue(r.andatoInRosso(), "senza cuscinetto deve finire in rosso");
        assertEquals(15, r.giornoRosso(), "il rosso arriva col guasto al giorno 15");
        assertEquals(-160, r.saldoMinimo());
        assertFalse(r.salvatoDalCuscinetto());
        assertEquals(0, r.resilienceScore(), "in rosso, senza margine: score 0");
    }

    @Test
    void cuscinettoSufficiente_evitaIlRosso_eSalva() {
        SimulationResult r = engine.simula(ScenarioFactory.demoLiquidita(), 300, usaCuscinettoSulloShock());
        assertFalse(r.andatoInRosso(), "il cuscinetto copre l'imprevisto");
        assertEquals(140, r.saldoMinimo());
        assertEquals(300, r.cuscinettoUsato());
        assertTrue(r.salvatoDalCuscinetto(), "senza cuscinetto sarebbe andato in rosso, con esso no");
        assertTrue(r.resilienceScore() > 0);
    }

    @Test
    void cuscinettoParziale_attenuaMaNonBasta() {
        SimulationResult r = engine.simula(ScenarioFactory.demoLiquidita(), 150, usaCuscinettoSulloShock());
        assertTrue(r.andatoInRosso(), "150 non basta a coprire un imprevisto da 300");
        assertEquals(-10, r.saldoMinimo(), "il rosso e' molto piu' lieve: solo -10");
        assertEquals(150, r.cuscinettoUsato());
        assertFalse(r.salvatoDalCuscinetto());
    }

    @Test
    void piuCuscinetto_nonPeggioraLoScore() {
        int score300 = engine.simula(ScenarioFactory.demoLiquidita(), 300, usaCuscinettoSulloShock()).resilienceScore();
        int score1000 = engine.simula(ScenarioFactory.demoLiquidita(), 1000, usaCuscinettoSulloShock()).resilienceScore();
        assertTrue(score1000 >= score300, "piu' autonomia => score non inferiore");
    }
}
