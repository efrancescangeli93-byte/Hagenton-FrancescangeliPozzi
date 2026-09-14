package com.hackathon.hagenton.engine;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Il cuore deterministico di "Fine Mese".
 * Dato uno scenario, calcola il saldo giorno per giorno e produce il registro
 * dei movimenti, rilevando se e quando si finisce in rosso.
 * Nessun LLM qui dentro: questa e' la verita' sui numeri.
 */
@Service
public class SimulationEngine {

    private static final int GIORNI_MESE = 30;

    public SimulationResult simula(Scenario s) {
        int totGiorni = s.mesi() * GIORNI_MESE;
        List<Movimento> movimenti = new ArrayList<>();

        int saldo = s.persona().saldoIniziale();
        int saldoMin = saldo;
        int giornoRosso = -1;

        for (int giorno = 1; giorno <= totGiorni; giorno++) {
            int mese = ((giorno - 1) / GIORNI_MESE) + 1;
            int giornoNelMese = ((giorno - 1) % GIORNI_MESE) + 1;

            // 1) Stipendio (con eventuale ritardo del mese)
            int ritardo = ritardoDelMese(s, mese);
            int giornoAccredito = Math.min(s.persona().giornoStipendio() + ritardo, GIORNI_MESE);
            if (giornoNelMese == giornoAccredito) {
                saldo += s.persona().stipendio();
                String et = "Stipendio" + (ritardo > 0 ? " (in ritardo di " + ritardo + " gg)" : "");
                movimenti.add(new Movimento(giorno, mese, et, s.persona().stipendio(), saldo));
            }

            // 2) Costi fissi
            for (CostoFisso c : s.costiFissi()) {
                if (giornoNelMese == c.giorno()) {
                    saldo -= c.importo();
                    movimenti.add(new Movimento(giorno, mese, c.etichetta(), -c.importo(), saldo));
                }
            }

            // 3) Eventi
            for (Evento e : s.eventi()) {
                saldo = applicaEvento(e, giorno, mese, giornoNelMese, saldo, movimenti);
            }

            if (saldo < saldoMin) saldoMin = saldo;
            if (saldo < 0 && giornoRosso == -1) giornoRosso = giorno;
        }

        return new SimulationResult(movimenti, saldo, saldoMin, giornoRosso != -1, giornoRosso, s.messaggioApertura());
    }

    private int ritardoDelMese(Scenario s, int mese) {
        for (Evento e : s.eventi()) {
            if (e.tipo() == TipoEvento.STIPENDIO_RITARDO && e.mese() == mese) {
                return e.giorniRitardo();
            }
        }
        return 0;
    }

    private int applicaEvento(Evento e, int giorno, int mese, int giornoNelMese, int saldo, List<Movimento> mov) {
        int giornoEvento = e.giorno() > 0 ? e.giorno() : 15;
        switch (e.tipo()) {
            case SPESA_UNA_TANTUM, AUMENTO_BOLLETTA -> {
                if (e.mese() == mese && giornoNelMese == giornoEvento) {
                    saldo -= e.importo();
                    mov.add(new Movimento(giorno, mese, etichetta(e, "Spesa imprevista"), -e.importo(), saldo));
                }
            }
            case ENTRATA_EXTRA -> {
                if (e.mese() == mese && giornoNelMese == giornoEvento) {
                    saldo += e.importo();
                    mov.add(new Movimento(giorno, mese, etichetta(e, "Entrata extra"), e.importo(), saldo));
                }
            }
            case ABBONAMENTO_RICORRENTE -> {
                if (mese >= e.mese() && giornoNelMese == giornoEvento) {
                    saldo -= e.importoMensile();
                    mov.add(new Movimento(giorno, mese, etichetta(e, "Abbonamento"), -e.importoMensile(), saldo));
                }
            }
            case STIPENDIO_RITARDO -> { /* gestito nel calcolo dello stipendio */ }
        }
        return saldo;
    }

    private String etichetta(Evento e, String fallback) {
        return (e.etichetta() != null && !e.etichetta().isBlank()) ? e.etichetta() : fallback;
    }
}
