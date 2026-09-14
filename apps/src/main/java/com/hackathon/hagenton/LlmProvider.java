package com.hackathon.hagenton;

/**
 * Astrazione del "cervello" AI. Implementazioni intercambiabili:
 * - ClaudeService  -> CLI locale (sottoscrizione, nessuna API key)
 * - (futuro) provider via API free  -> portabile su qualsiasi macchina
 * Riceve un prompt completo (istruzioni + input) e restituisce il testo di risposta.
 */
public interface LlmProvider {
    String completa(String prompt);
}
