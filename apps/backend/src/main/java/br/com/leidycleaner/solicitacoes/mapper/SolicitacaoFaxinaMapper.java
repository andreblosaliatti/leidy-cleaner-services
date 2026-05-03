package br.com.leidycleaner.solicitacoes.mapper;

import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaDto;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;

public final class SolicitacaoFaxinaMapper {

    private SolicitacaoFaxinaMapper() {
    }

    public static SolicitacaoFaxinaDto paraDto(SolicitacaoFaxina solicitacao) {
        return new SolicitacaoFaxinaDto(
                solicitacao.getId(),
                solicitacao.getCliente().getId(),
                solicitacao.getEndereco().getId(),
                solicitacao.getRegiao().getId(),
                solicitacao.getCliente().getUsuario().getNomeCompleto(),
                formatarEndereco(solicitacao),
                solicitacao.getEndereco().getBairro(),
                solicitacao.getRegiao().getNome(),
                solicitacao.getDataHoraDesejada(),
                solicitacao.getDuracaoEstimadaHoras(),
                solicitacao.getTipoServico(),
                solicitacao.getObservacoes(),
                solicitacao.getValorServico(),
                solicitacao.getPercentualComissaoAgencia(),
                solicitacao.getValorEstimadoProfissional(),
                solicitacao.getStatus(),
                solicitacao.getCriadoEm(),
                solicitacao.getAtualizadoEm()
        );
    }

    private static String formatarEndereco(SolicitacaoFaxina solicitacao) {
        var endereco = solicitacao.getEndereco();
        String complemento = endereco.getComplemento() == null || endereco.getComplemento().isBlank()
                ? ""
                : ", " + endereco.getComplemento();
        return "%s, %s%s - %s, %s/%s".formatted(
                endereco.getLogradouro(),
                endereco.getNumero(),
                complemento,
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado()
        );
    }
}
