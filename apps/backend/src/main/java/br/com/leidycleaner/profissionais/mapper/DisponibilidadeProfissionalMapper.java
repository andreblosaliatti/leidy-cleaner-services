package br.com.leidycleaner.profissionais.mapper;

import br.com.leidycleaner.profissionais.dto.DisponibilidadeProfissionalDto;
import br.com.leidycleaner.profissionais.entity.DisponibilidadeProfissional;

public final class DisponibilidadeProfissionalMapper {

    private DisponibilidadeProfissionalMapper() {
    }

    public static DisponibilidadeProfissionalDto paraDto(DisponibilidadeProfissional disponibilidade) {
        return new DisponibilidadeProfissionalDto(
                disponibilidade.getId(),
                disponibilidade.getDiaSemana(),
                disponibilidade.getHoraInicio(),
                disponibilidade.getHoraFim(),
                disponibilidade.isAtivo()
        );
    }
}
