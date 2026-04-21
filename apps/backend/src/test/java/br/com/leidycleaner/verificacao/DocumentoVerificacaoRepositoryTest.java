package br.com.leidycleaner.verificacao;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;
import br.com.leidycleaner.verificacao.entity.DocumentoVerificacao;
import br.com.leidycleaner.verificacao.entity.StatusVerificacao;
import br.com.leidycleaner.verificacao.repository.DocumentoVerificacaoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DocumentoVerificacaoRepositoryTest {

    private final DocumentoVerificacaoRepository documentoVerificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    DocumentoVerificacaoRepositoryTest(
            DocumentoVerificacaoRepository documentoVerificacaoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.documentoVerificacaoRepository = documentoVerificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Test
    void verificacaoEfetivaAprovadaQuandoDocumentoMaisRecenteEstaAprovado() {
        Usuario usuario = criarUsuario("verificacao.aprovada@example.com");

        DocumentoVerificacao documento = criarDocumento(usuario);
        documento.analisar(StatusVerificacao.APROVADO, "Aprovado para teste", usuario);
        documentoVerificacaoRepository.saveAndFlush(documento);

        assertThat(documentoVerificacaoRepository.findVerificacaoEfetivaPorUsuarioId(usuario.getId()))
                .map(DocumentoVerificacao::getStatusVerificacao)
                .contains(StatusVerificacao.APROVADO);
        assertThat(documentoVerificacaoRepository.usuarioPossuiVerificacaoEfetivaAprovada(usuario.getId()))
                .isTrue();
    }

    @Test
    void verificacaoEfetivaRejeitadaInvalidaAprovacaoHistorica() {
        Usuario usuario = criarUsuario("verificacao.rejeitada@example.com");

        criarDocumentoAnalisado(usuario, StatusVerificacao.APROVADO);
        criarDocumentoAnalisado(usuario, StatusVerificacao.REJEITADO);

        assertThat(documentoVerificacaoRepository.findVerificacaoEfetivaPorUsuarioId(usuario.getId()))
                .map(DocumentoVerificacao::getStatusVerificacao)
                .contains(StatusVerificacao.REJEITADO);
        assertThat(documentoVerificacaoRepository.usuarioPossuiVerificacaoEfetivaAprovada(usuario.getId()))
                .isFalse();
    }

    @Test
    void verificacaoEfetivaEmAnaliseInvalidaAprovacaoHistorica() {
        Usuario usuario = criarUsuario("verificacao.em-analise@example.com");

        criarDocumentoAnalisado(usuario, StatusVerificacao.APROVADO);
        criarDocumentoAnalisado(usuario, StatusVerificacao.EM_ANALISE);

        assertThat(documentoVerificacaoRepository.findVerificacaoEfetivaPorUsuarioId(usuario.getId()))
                .map(DocumentoVerificacao::getStatusVerificacao)
                .contains(StatusVerificacao.EM_ANALISE);
        assertThat(documentoVerificacaoRepository.usuarioPossuiVerificacaoEfetivaAprovada(usuario.getId()))
                .isFalse();
    }

    @Test
    void verificacaoEfetivaNaoAprovadaQuandoNaoExisteDocumentoAprovadoAtual() {
        Usuario usuario = criarUsuario("verificacao.pendente@example.com");

        criarDocumento(usuario);

        assertThat(documentoVerificacaoRepository.findVerificacaoEfetivaPorUsuarioId(usuario.getId()))
                .map(DocumentoVerificacao::getStatusVerificacao)
                .contains(StatusVerificacao.PENDENTE);
        assertThat(documentoVerificacaoRepository.usuarioPossuiVerificacaoEfetivaAprovada(usuario.getId()))
                .isFalse();
    }

    private Usuario criarUsuario(String email) {
        return usuarioRepository.saveAndFlush(new Usuario(
                "Profissional Verificacao",
                email,
                "+5551999990000",
                "$2a$10$hash-de-teste-nao-e-senha-crua",
                TipoUsuario.PROFISSIONAL,
                StatusConta.ATIVA
        ));
    }

    private DocumentoVerificacao criarDocumentoAnalisado(Usuario usuario, StatusVerificacao statusVerificacao) {
        DocumentoVerificacao documento = criarDocumento(usuario);
        documento.analisar(statusVerificacao, "Analise para teste", usuario);
        return documentoVerificacaoRepository.saveAndFlush(documento);
    }

    private DocumentoVerificacao criarDocumento(Usuario usuario) {
        return documentoVerificacaoRepository.saveAndFlush(new DocumentoVerificacao(
                usuario,
                "CPF",
                "12345678901",
                "local/documentos/frente.png",
                "local/documentos/verso.png",
                "local/documentos/selfie.png",
                "local/documentos/comprovante.png"
        ));
    }
}
