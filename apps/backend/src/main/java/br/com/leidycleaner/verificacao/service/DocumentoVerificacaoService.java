package br.com.leidycleaner.verificacao.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;
import br.com.leidycleaner.verificacao.dto.AnalisarDocumentoVerificacaoRequest;
import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoDto;
import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoRequest;
import br.com.leidycleaner.verificacao.entity.DocumentoVerificacao;
import br.com.leidycleaner.verificacao.mapper.DocumentoVerificacaoMapper;
import br.com.leidycleaner.verificacao.repository.DocumentoVerificacaoRepository;

@Service
public class DocumentoVerificacaoService {

    private final DocumentoVerificacaoRepository documentoVerificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public DocumentoVerificacaoService(
            DocumentoVerificacaoRepository documentoVerificacaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.documentoVerificacaoRepository = documentoVerificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public DocumentoVerificacaoDto registrar(Long usuarioId, DocumentoVerificacaoRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
        DocumentoVerificacao documento = documentoVerificacaoRepository.save(new DocumentoVerificacao(
                usuario,
                request.tipoDocumento().trim(),
                request.numeroDocumento().trim(),
                request.documentoFrenteUrl(),
                request.documentoVersoUrl(),
                request.selfieUrl(),
                request.comprovanteResidenciaUrl()
        ));
        return DocumentoVerificacaoMapper.paraDto(documento);
    }

    @Transactional(readOnly = true)
    public DocumentoVerificacaoDto minhaVerificacao(Long usuarioId) {
        return documentoVerificacaoRepository.findVerificacaoEfetivaPorUsuarioId(usuarioId)
                .map(DocumentoVerificacaoMapper::paraDto)
                .orElseThrow(() -> new BusinessException("VERIFICACAO_NOT_FOUND", "Verificacao nao encontrada", HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<DocumentoVerificacaoDto> listarTodas() {
        return documentoVerificacaoRepository.findByOrderByCriadoEmDesc()
                .stream()
                .map(DocumentoVerificacaoMapper::paraDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentoVerificacaoDto buscarPorId(Long id) {
        return documentoVerificacaoRepository.findById(id)
                .map(DocumentoVerificacaoMapper::paraDto)
                .orElseThrow(() -> new BusinessException("VERIFICACAO_NOT_FOUND", "Verificacao nao encontrada", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public DocumentoVerificacaoDto analisar(Long id, Long adminUsuarioId, AnalisarDocumentoVerificacaoRequest request) {
        DocumentoVerificacao documento = documentoVerificacaoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("VERIFICACAO_NOT_FOUND", "Verificacao nao encontrada", HttpStatus.NOT_FOUND));
        Usuario admin = buscarUsuario(adminUsuarioId);
        documento.analisar(request.statusVerificacao(), request.observacaoAnalise(), admin);
        return DocumentoVerificacaoMapper.paraDto(documento);
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("USUARIO_NOT_FOUND", "Usuario nao encontrado", HttpStatus.NOT_FOUND));
    }
}
