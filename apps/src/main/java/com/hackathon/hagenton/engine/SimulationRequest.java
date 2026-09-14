package com.hackathon.hagenton.engine;

import java.util.List;

public record SimulationRequest(Scenario scenario, int cuscinetto, List<Decisione> decisioni) {}
