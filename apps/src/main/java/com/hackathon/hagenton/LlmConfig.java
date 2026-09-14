package com.hackathon.hagenton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Seleziona il provider AI attivo in base a llm.provider:
 * - "claude-cli" (default): usa la sottoscrizione locale (nessuna API key)
 * - "gemini": usa l'API free di Google Gemini (portabile, richiede GEMINI_API_KEY)
 */
@Configuration
public class LlmConfig {

    private static final Logger log = LoggerFactory.getLogger(LlmConfig.class);

    @Bean
    @Primary
    public LlmProvider llmProvider(
            @Value("${llm.provider:claude-cli}") String provider,
            ClaudeService claude,
            GeminiProvider gemini) {
        if ("gemini".equalsIgnoreCase(provider)) {
            log.info("Provider AI attivo: Gemini (API free)");
            return gemini;
        }
        log.info("Provider AI attivo: Claude CLI (sottoscrizione)");
        return claude;
    }
}
