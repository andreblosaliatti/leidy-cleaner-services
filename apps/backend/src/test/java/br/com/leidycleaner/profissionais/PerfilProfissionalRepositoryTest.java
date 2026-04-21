package br.com.leidycleaner.profissionais;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.profissionais.entity.DiaSemana;
import br.com.leidycleaner.profissionais.entity.DisponibilidadeProfissional;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.entity.ProfissionalRegiao;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.profissionais.repository.DisponibilidadeProfissionalRepository;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.profissionais.repository.ProfissionalRegiaoRepository;
import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;
import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;
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
class PerfilProfissionalRepositoryTest {

    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final UsuarioRepository usuarioRepository;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;
    private final ProfissionalRegiaoRepository profissionalRegiaoRepository;
    private final DisponibilidadeProfissionalRepository disponibilidadeProfissionalRepository;
    private final DocumentoVerificacaoRepository documentoVerificacaoRepository;

    @Autowired
    PerfilProfissionalRepositoryTest(
            PerfilProfissionalRepository perfilProfissionalRepository,
            UsuarioRepository usuarioRepository,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository,
            ProfissionalRegiaoRepository profissionalRegiaoRepository,
            DisponibilidadeProfissionalRepository disponibilidadeProfissionalRepository,
            DocumentoVerificacaoRepository documentoVerificacaoRepository
    ) {
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.usuarioRepository = usuarioRepository;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
        this.profissionalRegiaoRepository = profissionalRegiaoRepository;
        this.disponibilidadeProfissionalRepository = disponibilidadeProfissionalRepository;
        this.documentoVerificacaoRepository = documentoVerificacaoRepository;
    }

    @Test
    void consultaDeElegibilidadeUsaVerificacaoEfetivaAprovada() {
        RegiaoAtendimento regiao = regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc().get(0);
        PerfilProfissional aprovadaAtual = criarProfissionalComBaseElegivel(
                "repo.elegivel.aprovada@example.com",
                "81122233344",
                "A Profissional Aprovada",
                regiao
        );
        criarDocumentoAnalisado(aprovadaAtual.getUsuario(), StatusVerificacao.APROVADO);

        PerfilProfissional aprovadaDepoisRejeitada = criarProfissionalComBaseElegivel(
                "repo.elegivel.rejeitada@example.com",
                "81222233344",
                "B Profissional Rejeitada",
                regiao
        );
        criarDocumentoAnalisado(aprovadaDepoisRejeitada.getUsuario(), StatusVerificacao.APROVADO);
        criarDocumentoAnalisado(aprovadaDepoisRejeitada.getUsuario(), StatusVerificacao.REJEITADO);

        PerfilProfissional aprovadaDepoisEmAnalise = criarProfissionalComBaseElegivel(
                "repo.elegivel.em-analise@example.com",
                "81322233344",
                "C Profissional Em Analise",
                regiao
        );
        criarDocumentoAnalisado(aprovadaDepoisEmAnalise.getUsuario(), StatusVerificacao.APROVADO);
        criarDocumentoAnalisado(aprovadaDepoisEmAnalise.getUsuario(), StatusVerificacao.EM_ANALISE);

        List<Long> idsRetornados = perfilProfissionalRepository.findElegiveisParaSolicitacao(
                        regiao.getId(),
                        DiaSemana.QUINTA,
                        LocalTime.of(10, 0),
                        StatusConta.ATIVA,
                        StatusAprovacaoProfissional.APROVADO,
                        StatusVerificacao.APROVADO
                )
                .stream()
                .map(PerfilProfissional::getId)
                .toList();

        assertThat(idsRetornados)
                .contains(aprovadaAtual.getId())
                .doesNotContain(aprovadaDepoisRejeitada.getId(), aprovadaDepoisEmAnalise.getId());
    }

    private PerfilProfissional criarProfissionalComBaseElegivel(
            String email,
            String cpf,
            String nomeExibicao,
            RegiaoAtendimento regiao
    ) {
        Usuario usuario = usuarioRepository.saveAndFlush(new Usuario(
                nomeExibicao,
                email,
                "+5551999990000",
                "$2a$10$hash-de-teste-nao-e-senha-crua",
                TipoUsuario.PROFISSIONAL,
                StatusConta.ATIVA
        ));
        PerfilProfissional perfil = perfilProfissionalRepository.saveAndFlush(new PerfilProfissional(
                usuario,
                nomeExibicao,
                cpf,
                LocalDate.of(1990, 1, 15),
                "Profissional elegivel em teste de repositorio",
                null,
                3,
                true,
                StatusAprovacaoProfissional.APROVADO
        ));
        profissionalRegiaoRepository.saveAndFlush(new ProfissionalRegiao(perfil, regiao));
        disponibilidadeProfissionalRepository.saveAndFlush(new DisponibilidadeProfissional(
                perfil,
                DiaSemana.QUINTA,
                LocalTime.of(8, 0),
                LocalTime.of(12, 0),
                true
        ));
        return perfil;
    }

    private DocumentoVerificacao criarDocumentoAnalisado(Usuario usuario, StatusVerificacao statusVerificacao) {
        DocumentoVerificacao documento = documentoVerificacaoRepository.saveAndFlush(new DocumentoVerificacao(
                usuario,
                "CPF",
                "12345678901",
                "local/documentos/frente.png",
                "local/documentos/verso.png",
                "local/documentos/selfie.png",
                "local/documentos/comprovante.png"
        ));
        documento.analisar(statusVerificacao, "Analise para teste de elegibilidade", usuario);
        return documentoVerificacaoRepository.saveAndFlush(documento);
    }
}
