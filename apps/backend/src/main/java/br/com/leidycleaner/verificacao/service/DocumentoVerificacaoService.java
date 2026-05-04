package br.com.leidycleaner.verificacao.service;

import java.util.Base64;
import java.util.List;
import java.util.Set;

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
        
        // Validar imagens Base64
        validarImagemBase64(request.documentoFrenteUrl(), "documentoFrenteUrl");
        validarImagemBase64(request.documentoVersoUrl(), "documentoVersoUrl");
        validarImagemBase64(request.selfieUrl(), "selfieUrl");
        validarImagemBase64(request.comprovanteResidenciaUrl(), "comprovanteResidenciaUrl");
        
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
        return documentoVerificacaoRepository.findByIdWithUsuarios(id)
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

    private void validarImagemBase64(String base64Image, String fieldName) {
        if (base64Image == null || base64Image.trim().isEmpty()) {
            return; // Campo opcional
        }

        // Preserve existing URL/path semantics: only validate strict Base64 data URLs.
        if (!base64Image.startsWith("data:")) {
            return;
        }

        try {
            // Extrair MIME type
            int commaIndex = base64Image.indexOf(',');
            if (commaIndex == -1) {
                throw new BusinessException("INVALID_BASE64_FORMAT", 
                    String.format("%s deve ser um data URL Base64 válido", fieldName), HttpStatus.BAD_REQUEST);
            }

            String mimePart = base64Image.substring(5, commaIndex);
            String[] mimeParts = mimePart.split(";");

            if (mimeParts.length < 1) {
                throw new BusinessException("INVALID_BASE64_FORMAT", 
                    String.format("%s deve ter um MIME type válido", fieldName), HttpStatus.BAD_REQUEST);
            }

            String mimeType = mimeParts[0];
            Set<String> allowedMimeTypes = Set.of("image/jpeg", "image/png", "image/webp");

            if (!allowedMimeTypes.contains(mimeType)) {
                throw new BusinessException("UNSUPPORTED_MIME_TYPE", 
                    String.format("%s deve ser uma imagem JPEG, PNG ou WebP", fieldName), HttpStatus.BAD_REQUEST);
            }

            // Verificar se tem base64
            if (mimeParts.length < 2 || !"base64".equals(mimeParts[1])) {
                throw new BusinessException("INVALID_BASE64_FORMAT", 
                    String.format("%s deve ser codificado em Base64", fieldName), HttpStatus.BAD_REQUEST);
            }

            // Decodificar e verificar tamanho
            String base64Data = base64Image.substring(commaIndex + 1);
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);

            // Limite de 2MB após decodificação
            if (decodedBytes.length > 2 * 1024 * 1024) {
                throw new BusinessException("IMAGE_TOO_LARGE", 
                    String.format("%s deve ter no máximo 2MB", fieldName), HttpStatus.BAD_REQUEST);
            }

        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_BASE64", 
                String.format("%s contém Base64 inválido", fieldName), HttpStatus.BAD_REQUEST);
        }
    }
}
