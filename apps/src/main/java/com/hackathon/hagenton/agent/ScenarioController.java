package com.hackathon.hagenton.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.hackathon.hagenton.engine.Scenario;
import com.hackathon.hagenton.engine.ScenarioFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ScenarioController {

    private static final Logger log = LoggerFactory.getLogger(ScenarioController.class);

    private final AgentRunner runner;

    public ScenarioController(AgentRunner runner) {
        this.runner = runner;
    }

    public record ParolaRequest(String parola) {}

    /** Parola chiave -> il Regista compone lo scenario -> il motore valida e clampa. */
    @PostMapping("/scenario/da-parola")
    public Scenario daParola(@RequestBody ParolaRequest req) {
        try {
            JsonNode json = runner.runJson("regista", req.parola());
            return ScenarioMapper.fromRegista(json);
        } catch (Exception e) {
            log.warn("Regista non disponibile, uso scenario di fallback. ({})", e.getMessage());
            return ScenarioFactory.demoLiquidita();
        }
    }
}
