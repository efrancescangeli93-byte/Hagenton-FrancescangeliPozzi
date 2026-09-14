package com.hackathon.hagenton.agent;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Carica i prompt degli agenti dalla cartella ../agent (rilettura a ogni chiamata). */
@Component
public class AgentPrompts {

    private static final List<String> BASE_DIRS = List.of("../agent/", "agent/", "../../agent/");

    public String load(String name) {
        for (String dir : BASE_DIRS) {
            Path p = Path.of(dir + name + ".txt");
            try {
                if (Files.isReadable(p)) {
                    String s = Files.readString(p, StandardCharsets.UTF_8).strip();
                    if (!s.isBlank()) return s;
                }
            } catch (Exception ignore) {
                // prova il percorso successivo
            }
        }
        throw new IllegalStateException("Prompt agente non trovato: " + name);
    }
}
