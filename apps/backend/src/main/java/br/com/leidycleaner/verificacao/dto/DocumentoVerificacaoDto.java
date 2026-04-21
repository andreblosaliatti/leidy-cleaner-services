package br.com.leidycleaner.verificacao.dto;

import java.time.OffsetDateTime;

import br.com.leidycleaner.verificacao.entity.StatusVerificacao;

public record DocumentoVerificacaoDto(
        Long id,
        Long usuarioId,
        String tipoDocumento,
        String numeroDocumento,
        String documentoFrenteUrl,
        String documentoVersoUrl,
        String selfieUrl,
        String comprovanteResidenciaUrl,
        StatusVerificacao statusVerificacao,
        String observacaoAnalise,
        Long analisadoPorUsuarioId,
        OffsetDateTime analisadoEm,
        OffsetDateTime criadoEm
) {
}
