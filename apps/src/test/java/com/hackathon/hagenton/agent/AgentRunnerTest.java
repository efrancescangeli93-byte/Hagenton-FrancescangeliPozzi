package com.hackathon.hagenton.agent;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AgentRunnerTest {

    @Test
    void estraeJsonPuro() {
        assertEquals("{\"a\":1}", AgentRunner.extractJson("{\"a\":1}"));
    }

    @Test
    void toglieIFenceJson() {
        String in = "```json\n{\"a\":1}\n```";
        assertEquals("{\"a\":1}", AgentRunner.extractJson(in));
    }

    @Test
    void estraeJsonAnnidatoNelTesto() {
        String in = "Ecco lo scenario:\n{\"a\":1,\"b\":2}\nSpero vada bene.";
        assertEquals("{\"a\":1,\"b\":2}", AgentRunner.extractJson(in));
    }

    @Test
    void gestisceOggettiConGraffeInterne() {
        String in = "```\n{\"x\":{\"y\":1}}\n```";
        assertEquals("{\"x\":{\"y\":1}}", AgentRunner.extractJson(in));
    }
}
