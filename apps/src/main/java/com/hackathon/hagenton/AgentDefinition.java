package com.hackathon.hagenton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Carica la definizione dell'agente dalla cartella ../agent.
 * Il system prompt viene riletto a ogni richiesta: modifichi il file e la
 * modifica ha effetto al messaggio successivo, senza riavviare l'app.
 */
@Component
public class AgentDefinition {

    private static final Logger log = LoggerFactory.getLogger(AgentDefinition.class);

    private static final String DEFAULT_PROMPT =
            "Sei un assistente AI utile e conciso. Rispondi in italiano con linguaggio chiaro.";

    private final List<Path> candidates = new ArrayList<>();

    public AgentDefinition(@Value("${agent.system-prompt-path:../agent/system-prompt.txt}") String configuredPath) {
        candidates.add(Path.of(configuredPath));
        candidates.add(Path.of("agent/system-prompt.txt"));
        candidates.add(Path.of("../agent/system-prompt.txt"));
        candidates.add(Path.of("../../agent/system-prompt.txt"));
    }

    public String systemPrompt() {
        for (Path p : candidates) {
            try {
                if (Files.isReadable(p)) {
                    String content = Files.readString(p, StandardCharsets.UTF_8).strip();
                    if (!content.isBlank()) {
                        return content;
                    }
                }
            } catch (Exception e) {
                log.debug("Lettura fallita per {}: {}", p, e.getMessage());
            }
        }
        log.warn("system-prompt.txt non trovato: uso il prompt di default.");
        return DEFAULT_PROMPT;
    }
}
