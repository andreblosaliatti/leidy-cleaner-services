package br.com.leidycleaner.verificacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;
import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoRequest;
import br.com.leidycleaner.verificacao.service.DocumentoVerificacaoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentoVerificacaoServiceTest {

    private final DocumentoVerificacaoService documentoVerificacaoService;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    DocumentoVerificacaoServiceTest(
            DocumentoVerificacaoService documentoVerificacaoService,
            UsuarioRepository usuarioRepository
    ) {
        this.documentoVerificacaoService = documentoVerificacaoService;
        this.usuarioRepository = usuarioRepository;
    }

    @Test
    void registrarComImagemBase64Valida() {
        Usuario usuario = criarUsuario("teste@exemplo.com");
        String base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z";

        DocumentoVerificacaoRequest request = new DocumentoVerificacaoRequest(
                "RG", "123456789", base64Image, null, null, null
        );

        var result = documentoVerificacaoService.registrar(usuario.getId(), request);

        assertThat(result).isNotNull();
        assertThat(result.documentoFrenteUrl()).isEqualTo(base64Image);
    }

    @Test
    void registrarComImagemBase64Invalida() {
        Usuario usuario = criarUsuario("teste2@exemplo.com");
        String invalidBase64 = "data:image/jpeg;base64,invalidbase64";

        DocumentoVerificacaoRequest request = new DocumentoVerificacaoRequest(
                "RG", "123456789", invalidBase64, null, null, null
        );

        assertThatThrownBy(() -> documentoVerificacaoService.registrar(usuario.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo("INVALID_BASE64"));
    }

    @Test
    void registrarComMimeTypeNaoSuportado() {
        Usuario usuario = criarUsuario("teste3@exemplo.com");
        String unsupportedMime = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        DocumentoVerificacaoRequest request = new DocumentoVerificacaoRequest(
                "RG", "123456789", unsupportedMime, null, null, null
        );

        assertThatThrownBy(() -> documentoVerificacaoService.registrar(usuario.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo("UNSUPPORTED_MIME_TYPE"));
    }

    @Test
    void registrarComImagemMuitoGrande() {
        Usuario usuario = criarUsuario("teste4@exemplo.com");
        // Create a large base64 string (simulate >2MB)
        String largeBase64 = "data:image/jpeg;base64," + "A".repeat(3 * 1024 * 1024);

        DocumentoVerificacaoRequest request = new DocumentoVerificacaoRequest(
                "RG", "123456789", largeBase64, null, null, null
        );

        assertThatThrownBy(() -> documentoVerificacaoService.registrar(usuario.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo("IMAGE_TOO_LARGE"));
    }

    @Test
    void registrarComDataUrlInvalido() {
        Usuario usuario = criarUsuario("teste5@exemplo.com");
        String invalidDataUrl = "data:image/jpeg;base64";

        DocumentoVerificacaoRequest request = new DocumentoVerificacaoRequest(
                "RG", "123456789", invalidDataUrl, null, null, null
        );

        assertThatThrownBy(() -> documentoVerificacaoService.registrar(usuario.getId(), request))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo("INVALID_BASE64_FORMAT"));
    }

    private Usuario criarUsuario(String email) {
        Usuario usuario = new Usuario(
                email,
                "senha123",
                "Nome Teste",
                "(11) 99999-9999",
                TipoUsuario.PROFISSIONAL,
                StatusConta.ATIVA
        );
        return usuarioRepository.save(usuario);
    }
}