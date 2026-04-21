package br.com.leidycleaner.profissionais.dto;

import java.time.LocalTime;

import br.com.leidycleaner.profissionais.entity.DiaSemana;
import jakarta.validation.constraints.NotNull;

public record DisponibilidadeProfissionalRequest(
        @NotNull(message = "diaSemana e obrigatorio")
        DiaSemana diaSemana,

        @NotNull(message = "horaInicio e obrigatoria")
        LocalTime horaInicio,

        @NotNull(message = "horaFim e obrigatoria")
        LocalTime horaFim,

        Boolean ativo
) {
}
