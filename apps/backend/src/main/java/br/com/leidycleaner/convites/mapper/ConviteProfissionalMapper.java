package br.com.leidycleaner.convites.mapper;

import br.com.leidycleaner.convites.dto.ConviteProfissionalDto;
import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.enderecos.entity.Endereco;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;

public final class ConviteProfissionalMapper {

    private ConviteProfissionalMapper() {
    }

    public static ConviteProfissionalDto paraDto(ConviteProfissional convite) {
        SolicitacaoFaxina solicitacao = convite.getSolicitacao();
        Endereco endereco = solicitacao.getEndereco();
        return new ConviteProfissionalDto(
                convite.getId(),
                solicitacao.getId(),
                convite.getStatus(),
                convite.getEnviadoEm(),
                convite.getExpiraEm(),
                solicitacao.getDataHoraDesejada(),
                solicitacao.getDuracaoEstimadaHoras(),
                solicitacao.getTipoServico(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado(),
                solicitacao.getValorServico()
        );
    }
}
