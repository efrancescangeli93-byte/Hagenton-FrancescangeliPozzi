package com.hackathon.hagenton.engine;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Il cuore deterministico di "Fine Mese".
 * Dato uno scenario, un cuscinetto e le decisioni dell'utente, calcola il saldo
 * giorno per giorno, applica le scelte e rileva se/quando si finisce in rosso.
 * Nessun LLM qui dentro: questa e' la verita' sui numeri.
 */
@Service
public class SimulationEngine {

    private static final int GIORNI_MESE = 30;

    private record RunOutcome(
            List<Movimento> movimenti, int saldoFinale, int saldoMinimo,
            int giornoRosso, int cuscinettoFinale, int cuscinettoUsato) {
        boolean andatoInRosso() { return giornoRosso != -1; }
    }

    /** Simulazione passiva (nessuna scelta, nessun cuscinetto). */
    public SimulationResult simula(Scenario s) {
        return simula(s, 0, List.of());
    }

    /** Simulazione con cuscinetto e decisioni dell'utente. */
    public SimulationResult simula(Scenario s, int cuscinettoIniziale, List<Decisione> decisioni) {
        RunOutcome real = run(s, cuscinettoIniziale, decisioni);
        RunOutcome senzaCuscinetto = run(s, 0, decisioni);
        boolean salvato = senzaCuscinetto.andatoInRosso() && !real.andatoInRosso();
        return new SimulationResult(
                real.movimenti(), real.saldoFinale(), real.saldoMinimo(),
                real.andatoInRosso(), real.giornoRosso(),
                cuscinettoIniziale, real.cuscinettoFinale(), real.cuscinettoUsato(),
                salvato, s.messaggioApertura()
        );
    }

    private RunOutcome run(Scenario s, int cuscinettoIniziale, List<Decisione> decisioni) {
        int totGiorni = s.mesi() * GIORNI_MESE;
        List<Movimento> mov = new ArrayList<>();

        int saldo = s.persona().saldoIniziale();
        int buffer = cuscinettoIniziale;
        int cuscinettoUsato = 0;
        int saldoMin = saldo;
        int giornoRosso = -1;

        for (int giorno = 1; giorno <= totGiorni; giorno++) {
            int mese = ((giorno - 1) / GIORNI_MESE) + 1;
            int gm = ((giorno - 1) % GIORNI_MESE) + 1;

            // 1) Stipendio (con eventuale ritardo del mese)
            int ritardo = ritardoDelMese(s, mese);
            int gAcc = Math.min(s.persona().giornoStipendio() + ritardo, GIORNI_MESE);
            if (gm == gAcc) {
                saldo += s.persona().stipendio();
                String et = "Stipendio" + (ritardo > 0 ? " (in ritardo di " + ritardo + " gg)" : "");
                mov.add(new Movimento(giorno, mese, et, s.persona().stipendio(), saldo));
            }

            // 2) Costi fissi
            for (CostoFisso c : s.costiFissi()) {
                if (gm == c.giorno()) {
                    saldo -= c.importo();
                    mov.add(new Movimento(giorno, mese, c.etichetta(), -c.importo(), saldo));
                }
            }

            // 3) Eventi (con decisione dell'utente sugli imprevisti)
            List<Evento> eventi = s.eventi();
            for (int ei = 0; ei < eventi.size(); ei++) {
                Evento e = eventi.get(ei);
                int gEv = e.giorno() > 0 ? e.giorno() : 15;
                switch (e.tipo()) {
                    case SPESA_UNA_TANTUM, AUMENTO_BOLLETTA -> {
                        if (e.mese() == mese && gm == gEv) {
                            Azione az = azione(decisioni, ei);
                            int imp = e.importo();
                            if (az == Azione.USA_CUSCINETTO) {
                                int daCusc = Math.min(buffer, imp);
                                buffer -= daCusc;
                                cuscinettoUsato += daCusc;
                                int daConto = imp - daCusc;
                                saldo -= daConto;
                                String suffix = daCusc > 0 ? " (-€" + daCusc + " dal cuscinetto)" : "";
                                mov.add(new Movimento(giorno, mese, etichetta(e, "Spesa imprevista") + suffix, -daConto, saldo));
                            } else if (az == Azione.TAGLIA_VARIABILE) {
                                mov.add(new Movimento(giorno, mese, etichetta(e, "Spesa imprevista") + " (coperta tagliando spese variabili)", 0, saldo));
                            } else {
                                saldo -= imp;
                                mov.add(new Movimento(giorno, mese, etichetta(e, "Spesa imprevista"), -imp, saldo));
                            }
                        }
                    }
                    case ENTRATA_EXTRA -> {
                        if (e.mese() == mese && gm == gEv) {
                            saldo += e.importo();
                            mov.add(new Movimento(giorno, mese, etichetta(e, "Entrata extra"), e.importo(), saldo));
                        }
                    }
                    case ABBONAMENTO_RICORRENTE -> {
                        if (mese >= e.mese() && gm == gEv) {
                            saldo -= e.importoMensile();
                            mov.add(new Movimento(giorno, mese, etichetta(e, "Abbonamento"), -e.importoMensile(), saldo));
                        }
                    }
                    case STIPENDIO_RITARDO -> { /* gestito nel calcolo dello stipendio */ }
                }
            }

            if (saldo < saldoMin) saldoMin = saldo;
            if (saldo < 0 && giornoRosso == -1) giornoRosso = giorno;
        }

        return new RunOutcome(mov, saldo, saldoMin, giornoRosso, buffer, cuscinettoUsato);
    }

    private Azione azione(List<Decisione> decisioni, int eventoIndex) {
        if (decisioni != null) {
            for (Decisione d : decisioni) {
                if (d.eventoIndex() == eventoIndex) return d.azione();
            }
        }
        return Azione.PAGA_DAL_CONTO;
    }

    private int ritardoDelMese(Scenario s, int mese) {
        for (Evento e : s.eventi()) {
            if (e.tipo() == TipoEvento.STIPENDIO_RITARDO && e.mese() == mese) return e.giorniRitardo();
        }
        return 0;
    }

    private String etichetta(Evento e, String fallback) {
        return (e.etichetta() != null && !e.etichetta().isBlank()) ? e.etichetta() : fallback;
    }
}
