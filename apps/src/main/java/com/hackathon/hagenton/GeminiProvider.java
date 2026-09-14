package com.hackathon.hagenton;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Provider AI portabile via API free di Google Gemini.
 * Richiede una chiave gratuita (aistudio.google.com) in GEMINI_API_KEY.
 * Attivo quando llm.provider=gemini.
 */
@Component
public class GeminiProvider implements LlmProvider {

    private static final String BASE = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final ObjectMapper mapper = new ObjectMapper();
    private final RestClient http = RestClient.create();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String model;

    @Override
    public String completa(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY non impostata: impossibile usare il provider Gemini.");
        }
        String url = BASE + model + ":generateContent?key=" + apiKey;
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json")
        );
        String resp = http.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);
        try {
            JsonNode parts = mapper.readTree(resp).path("candidates").path(0).path("content").path("parts");
            for (JsonNode p : parts) {
                String t = p.path("text").asText("");
                if (!t.isBlank()) return t;
            }
            throw new RuntimeException("Gemini non ha restituito testo: " + resp);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Risposta Gemini non valida: " + resp, e);
        }
    }
}
