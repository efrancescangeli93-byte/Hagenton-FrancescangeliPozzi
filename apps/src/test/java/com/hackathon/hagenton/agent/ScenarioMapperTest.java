package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.hagenton.engine.Scenario;
import com.hackathon.hagenton.engine.TipoEvento;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScenarioMapperTest {

    private final ObjectMapper mapper = new ObjectMapper();

    private JsonNode json(String s) throws Exception {
        return mapper.readTree(s);
    }

    @Test
    void clampaValoriFuoriRange() throws Exception {
        Scenario s = ScenarioMapper.fromRegista(json("""
            {
              "concetto": "fondo_emergenza",
              "persona": { "nome": "Test", "stipendio": 99999, "giorno_stipendio": 40 },
              "mesi": 99,
              "eventi": [ { "tipo": "spesa_una_tantum", "mese": 1, "importo": 9999, "etichetta": "x" } ]
            }
            """));
        assertEquals(2500, s.persona().stipendio(), "stipendio clampato al massimo");
        assertEquals(28, s.persona().giornoStipendio(), "giorno stipendio clampato a 28");
        assertEquals(6, s.mesi(), "mesi clampati a 6");
        assertEquals(600, s.eventi().get(0).importo(), "importo spesa clampato a 600");
        assertEquals(1250, s.persona().saldoIniziale(), "saldo iniziale = 50% dello stipendio");
        assertEquals(3, s.costiFissi().size(), "costi fissi derivati");
    }

    @Test
    void scartaEventiConTipoSconosciuto() throws Exception {
        Scenario s = ScenarioMapper.fromRegista(json("""
            {
              "concetto": "fondo_emergenza",
              "persona": { "nome": "Test", "stipendio": 1200, "giorno_stipendio": 27 },
              "mesi": 2,
              "eventi": [
                { "tipo": "aliena", "mese": 1, "importo": 100 },
                { "tipo": "entrata_extra", "mese": 1, "importo": 100, "etichetta": "bonus" }
              ]
            }
            """));
        assertEquals(1, s.eventi().size(), "l'evento con tipo sconosciuto viene scartato");
        assertEquals(TipoEvento.ENTRATA_EXTRA, s.eventi().get(0).tipo());
    }

    @Test
    void usaIDefaultQuandoMancanoICampi() throws Exception {
        Scenario s = ScenarioMapper.fromRegista(json("{}"));
        assertEquals("fondo_emergenza", s.concetto(), "concetto di default");
        assertTrue(s.persona().stipendio() >= 800 && s.persona().stipendio() <= 2500);
        assertTrue(s.mesi() >= 1 && s.mesi() <= 6);
    }
}
