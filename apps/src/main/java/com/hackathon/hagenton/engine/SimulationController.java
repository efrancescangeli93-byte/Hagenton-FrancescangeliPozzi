package com.hackathon.hagenton.engine;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private final SimulationEngine engine;

    public SimulationController(SimulationEngine engine) {
        this.engine = engine;
    }

    /** Esegue lo scenario demo pre-scritto (Luca). */
    @GetMapping("/simula/demo")
    public SimulationResult demo() {
        return engine.simula(ScenarioFactory.demoLiquidita());
    }

    /** Esegue uno scenario passato dal client (es. prodotto dal Regista). */
    @PostMapping("/simula")
    public SimulationResult simula(@RequestBody Scenario scenario) {
        return engine.simula(scenario);
    }
}
