package br.com.leidycleaner.avaliacoes.mapper;

import br.com.leidycleaner.avaliacoes.dto.AvaliacaoProfissionalDto;
import br.com.leidycleaner.avaliacoes.entity.AvaliacaoProfissional;

public final class AvaliacaoProfissionalMapper {

    private AvaliacaoProfissionalMapper() {
    }

    public static AvaliacaoProfissionalDto paraDto(AvaliacaoProfissional avaliacao) {
        return new AvaliacaoProfissionalDto(
                avaliacao.getId(),
                avaliacao.getAtendimento().getId(),
                avaliacao.getProfissional().getId(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getCriadoEm()
        );
    }
}
