package br.com.leidycleaner.solicitacoes.dto;

import java.util.List;

public record SelecaoProfissionaisDto(
        Long solicitacaoId,
        List<ProfissionalSelecionadoDto> selecionados
) {
}
