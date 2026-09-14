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
 *
 * Nota importante: NON si passano prompt lunghi/complessi come argomenti da riga
 * di comando (su Windows ProcessBuilder rovina virgolette e parentesi). Tutto il
 * testo viaggia su STDIN.
 */
@Service
public class ClaudeService implements LlmProvider {

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${claude.executable:C:\\Users\\e.francescangeli\\.local\\bin\\claude.exe}")
    private String claudeExecutable;

    @Value("${claude.model:sonnet}")
    private String defaultModel;

    @Value("${claude.timeout-seconds:120}")
    private long timeoutSeconds;

    public record Result(String reply, String sessionId) {}

    /** Chat con memoria opzionale (session) e system prompt semplice. Usato dalla chat demo. */
    public Result ask(String prompt, String systemPrompt, String sessionId) {
        List<String> cmd = baseCmd();
        if (sessionId != null && !sessionId.isBlank()) {
            cmd.add("--resume");
            cmd.add(sessionId);
        } else if (systemPrompt != null && !systemPrompt.isBlank()) {
            cmd.add("--system-prompt");
            cmd.add(systemPrompt);
        }
        JsonNode node = esegui(cmd, prompt);
        return new Result(node.path("result").asText(""), node.path("session_id").asText(null));
    }

    /**
     * Esecuzione headless "pura": tutto il testo (istruzioni + input) va su stdin,
     * niente system prompt come argomento. E' il modo robusto per gli agenti.
     */
    @Override
    public String completa(String stdinPrompt) {
        JsonNode node = esegui(baseCmd(), stdinPrompt);
        return node.path("result").asText("");
    }

    private List<String> baseCmd() {
        List<String> cmd = new ArrayList<>();
        cmd.add(claudeExecutable);
        cmd.add("-p");
        cmd.add("--output-format");
        cmd.add("json");
        cmd.add("--model");
        cmd.add(defaultModel);
        return cmd;
    }

    private JsonNode esegui(List<String> cmd, String stdinPrompt) {
        try {
            Process process = new ProcessBuilder(cmd).start();

            try (OutputStream stdin = process.getOutputStream()) {
                stdin.write(stdinPrompt.getBytes(StandardCharsets.UTF_8));
            }

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
            return mapper.readTree(stdout);

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
