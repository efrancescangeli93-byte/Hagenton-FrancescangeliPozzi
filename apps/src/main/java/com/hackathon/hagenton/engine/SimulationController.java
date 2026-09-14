package com.hackathon.hagenton.engine;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private final SimulationEngine engine;

    public SimulationController(SimulationEngine engine) {
        this.engine = engine;
    }

    /**
     * Scenario demo (Luca). Parametri:
     * - cuscinetto: quanto messo da parte (default 0)
     * - scelta: come coprire l'imprevisto (PAGA_DAL_CONTO | USA_CUSCINETTO | TAGLIA_VARIABILE)
     */
    @GetMapping("/simula/demo")
    public SimulationResult demo(
            @RequestParam(defaultValue = "0") int cuscinetto,
            @RequestParam(defaultValue = "PAGA_DAL_CONTO") Azione scelta) {
        Scenario s = ScenarioFactory.demoLiquidita();
        int shock = indiceShock(s);
        List<Decisione> dec = shock >= 0 ? List.of(new Decisione(shock, scelta)) : List.of();
        return engine.simula(s, cuscinetto, dec);
    }

    /** Esegue uno scenario passato dal client (es. prodotto dal Regista) con scelte. */
    @PostMapping("/simula")
    public SimulationResult simula(@RequestBody SimulationRequest req) {
        List<Decisione> dec = req.decisioni() == null ? List.of() : req.decisioni();
        return engine.simula(req.scenario(), req.cuscinetto(), dec);
    }

    private int indiceShock(Scenario s) {
        List<Evento> eventi = s.eventi();
        for (int i = 0; i < eventi.size(); i++) {
            TipoEvento t = eventi.get(i).tipo();
            if (t == TipoEvento.SPESA_UNA_TANTUM || t == TipoEvento.AUMENTO_BOLLETTA) return i;
        }
        return -1;
    }
}
