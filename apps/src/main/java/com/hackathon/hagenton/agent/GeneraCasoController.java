package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * Genera un caso didattico completo (8 slot) a partire da una parola chiave,
 * usando l'agente "generatore" via il provider AI attivo (Gemini o Claude CLI).
 * Se l'AI non risponde ritorna 503 e se l'argomento e' fuori ambito 422:
 * mai un caso finto al posto di quello richiesto.
 */
@RestController
@RequestMapping("/api")
public class GeneraCasoController {

    private static final Logger log = LoggerFactory.getLogger(GeneraCasoController.class);

    private final AgentRunner runner;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeneraCasoController(AgentRunner runner) {
        this.runner = runner;
    }

    public record ParolaReq(String parola) {}

    private static final Set<String> AMBITI =
            Set.of("finanza", "economia", "tecnologia", "medicina", "diritto", "ambiente");

    @PostMapping("/genera-caso")
    public ResponseEntity<JsonNode> genera(@RequestBody ParolaReq req) {
        String parola = req.parola() == null ? "" : req.parola().trim();
        if (parola.isBlank()) {
            return ResponseEntity.unprocessableEntity().body(errore("Scrivi una parola per generare un caso."));
        }

        JsonNode caso;
        try {
            caso = runner.runJson("generatore", parola);
        } catch (Exception e) {
            log.warn("Generatore fallito per «{}»: {}", parola, e.getMessage());
            return ResponseEntity.status(503).body(errore(
                    "Non sono riuscito a generare il caso per «" + parola + "». Riprova tra un momento."));
        }

        String macrotema = caso.path("macrotema").asText("").trim().toLowerCase();
        if (!AMBITI.contains(macrotema)) {
            return ResponseEntity.unprocessableEntity().body(errore(
                    "«" + parola + "» non rientra negli argomenti disponibili "
                            + "(finanza, economia, tecnologia, medicina, diritto, ambiente)."));
        }
        return ResponseEntity.ok(caso);
    }

    private JsonNode errore(String messaggio) {
        ObjectNode n = mapper.createObjectNode();
        n.put("error", messaggio);
        return n;
    }
}
