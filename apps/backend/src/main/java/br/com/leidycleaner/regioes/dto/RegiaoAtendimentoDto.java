package br.com.leidycleaner.regioes.dto;

import br.com.leidycleaner.regioes.entity.TipoRegiaoAtendimento;

public record RegiaoAtendimentoDto(
        Long id,
        String nome,
        TipoRegiaoAtendimento tipo,
        boolean ativo
) {
}
