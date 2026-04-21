package br.com.leidycleaner.profissionais.dto;

import java.time.LocalTime;

import br.com.leidycleaner.profissionais.entity.DiaSemana;

public record DisponibilidadeProfissionalDto(
        Long id,
        DiaSemana diaSemana,
        LocalTime horaInicio,
        LocalTime horaFim,
        boolean ativo
) {
}
