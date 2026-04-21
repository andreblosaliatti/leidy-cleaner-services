package br.com.leidycleaner.solicitacoes.mapper;

import br.com.leidycleaner.solicitacoes.dto.ProfissionalSelecionadoDto;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;

public final class SolicitacaoProfissionalSelecionadoMapper {

    private SolicitacaoProfissionalSelecionadoMapper() {
    }

    public static ProfissionalSelecionadoDto paraDto(SolicitacaoProfissionalSelecionado selecionado) {
        return new ProfissionalSelecionadoDto(
                selecionado.getId(),
                selecionado.getProfissional().getId(),
                selecionado.getOrdemEscolha(),
                selecionado.getCriadoEm()
        );
    }
}
