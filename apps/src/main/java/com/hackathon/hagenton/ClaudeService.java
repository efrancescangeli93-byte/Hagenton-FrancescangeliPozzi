package com.hackathon.hagenton;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Chiama Claude tramite la CLI in modalità headless ("claude -p").
 * Usa la sottoscrizione con cui sei loggato in Claude Code: nessuna API key.
 */
@Service
public class ClaudeService {

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${claude.executable:C:\\Users\\e.francescangeli\\.local\\bin\\claude.exe}")
    private String claudeExecutable;

    @Value("${claude.model:sonnet}")
    private String defaultModel;

    @Value("${claude.timeout-seconds:120}")
    private long timeoutSeconds;

    public record Result(String reply, String sessionId) {}

    public Result ask(String prompt, String systemPrompt, String sessionId) {
        List<String> cmd = new ArrayList<>();
        cmd.add(claudeExecutable);
        cmd.add("-p");
        cmd.add("--output-format");
        cmd.add("json");
        cmd.add("--model");
        cmd.add(defaultModel);
        // Il system prompt e' fissato all'inizio della sessione; su --resume non serve.
        if (sessionId != null && !sessionId.isBlank()) {
            cmd.add("--resume");
            cmd.add(sessionId);
        } else if (systemPrompt != null && !systemPrompt.isBlank()) {
            cmd.add("--system-prompt");
            cmd.add(systemPrompt);
        }

        try {
            Process process = new ProcessBuilder(cmd).start();

            // Scrive il prompt su stdin (evita limiti/escaping degli argomenti).
            try (OutputStream stdin = process.getOutputStream()) {
                stdin.write(prompt.getBytes(StandardCharsets.UTF_8));
            }

            // Legge stdout e stderr in parallelo per non bloccare le pipe.
            CompletableFuture<String> out = readStream(process.getInputStream());
            CompletableFuture<String> err = readStream(process.getErrorStream());

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Timeout: Claude non ha risposto entro " + timeoutSeconds + "s");
            }

            String stdout = out.join();
            String stderr = err.join();

            if (process.exitValue() != 0) {
                throw new RuntimeException("Errore dalla CLI di Claude: " + stderr);
            }

            JsonNode node = mapper.readTree(stdout);
            String reply = node.path("result").asText("");
            String returnedSession = node.path("session_id").asText(null);
            return new Result(reply, returnedSession);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Impossibile eseguire Claude: " + e.getMessage(), e);
        }
    }

    private CompletableFuture<String> readStream(java.io.InputStream in) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                return "";
            }
        });
    }
}
