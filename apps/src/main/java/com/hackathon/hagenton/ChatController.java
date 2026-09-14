package com.hackathon.hagenton;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ClaudeService claudeService;
    private final AgentDefinition agent;

    public ChatController(ClaudeService claudeService, AgentDefinition agent) {
        this.claudeService = claudeService;
        this.agent = agent;
    }

    public record ChatRequest(String message, String sessionId) {}

    public record ChatResponse(String reply, String sessionId) {}

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        ClaudeService.Result result =
                claudeService.ask(request.message(), agent.systemPrompt(), request.sessionId());
        return new ChatResponse(result.reply(), result.sessionId());
    }
}
