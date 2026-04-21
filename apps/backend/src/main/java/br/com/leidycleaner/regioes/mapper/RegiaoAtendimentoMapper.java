package br.com.leidycleaner.regioes.mapper;

import br.com.leidycleaner.regioes.dto.RegiaoAtendimentoDto;
import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;

public final class RegiaoAtendimentoMapper {

    private RegiaoAtendimentoMapper() {
    }

    public static RegiaoAtendimentoDto paraDto(RegiaoAtendimento regiao) {
        return new RegiaoAtendimentoDto(regiao.getId(), regiao.getNome(), regiao.getTipo(), regiao.isAtivo());
    }
}
