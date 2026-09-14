package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.hagenton.LlmProvider;
import org.springframework.stereotype.Service;

/**
 * Esegue un agente definito in ../agent/<nome>.txt: carica quel testo come istruzioni,
 * lo unisce all'input e lo manda al provider AI (Claude CLI o API free), poi parsa l'output.
 */
@Service
public class AgentRunner {

    private final LlmProvider llm;
    private final AgentPrompts prompts;
    private final ObjectMapper mapper = new ObjectMapper();

    public AgentRunner(LlmProvider llm, AgentPrompts prompts) {
        this.llm = llm;
        this.prompts = prompts;
    }

    private static final String SEP = "\n\n===== INPUT UTENTE =====\n";

    /** Esegue un agente che risponde in JSON. Tollera fence ```json e testo attorno al JSON. */
    public JsonNode runJson(String agent, String input) {
        String raw = llm.completa(prompts.load(agent) + SEP + input);
        String json = extractJson(raw);
        try {
            return mapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Output non JSON dall'agente '" + agent + "': " + raw, e);
        }
    }

    /** Esegue un agente che risponde in testo semplice (es. Narratore). */
    public String runText(String agent, String input) {
        return llm.completa(prompts.load(agent) + SEP + input).strip();
    }

    static String stripFences(String s) {
        String t = s.strip();
        if (t.startsWith("```")) {
            int nl = t.indexOf('\n');
            if (nl >= 0) t = t.substring(nl + 1);
            if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
        }
        return t.strip();
    }

    /** Ripulisce i fence e, se resta del testo attorno, estrae il primo oggetto JSON {...}. */
    static String extractJson(String s) {
        String t = stripFences(s);
        int start = t.indexOf('{');
        int end = t.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return t.substring(start, end + 1);
        }
        return t;
    }
}
