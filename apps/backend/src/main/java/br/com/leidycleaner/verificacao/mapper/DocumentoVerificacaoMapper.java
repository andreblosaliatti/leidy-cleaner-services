package br.com.leidycleaner.verificacao.mapper;

import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoDto;
import br.com.leidycleaner.verificacao.entity.DocumentoVerificacao;

public final class DocumentoVerificacaoMapper {

    private DocumentoVerificacaoMapper() {
    }

    public static DocumentoVerificacaoDto paraDto(DocumentoVerificacao documento) {
        Long analisadoPorId = documento.getAnalisadoPorUsuario() == null ? null : documento.getAnalisadoPorUsuario().getId();
        String analisadoPorNome = documento.getAnalisadoPorUsuario() == null
                ? null
                : documento.getAnalisadoPorUsuario().getNomeCompleto();
        return new DocumentoVerificacaoDto(
                documento.getId(),
                documento.getUsuario().getId(),
                documento.getUsuario().getNomeCompleto(),
                documento.getTipoDocumento(),
                documento.getNumeroDocumento(),
                documento.getDocumentoFrenteUrl(),
                documento.getDocumentoVersoUrl(),
                documento.getSelfieUrl(),
                documento.getComprovanteResidenciaUrl(),
                documento.getStatusVerificacao(),
                documento.getObservacaoAnalise(),
                analisadoPorId,
                analisadoPorNome,
                documento.getAnalisadoEm(),
                documento.getCriadoEm()
        );
    }
}
