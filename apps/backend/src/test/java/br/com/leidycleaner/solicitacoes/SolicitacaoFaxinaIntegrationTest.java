package br.com.leidycleaner.solicitacoes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoProfissionalSelecionadoRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SolicitacaoFaxinaIntegrationTest {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;
    private final SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository;

    private record ProfissionalConfigurada(Long perfilId, String tokenProfissional) {
    }

    @Autowired
    SolicitacaoFaxinaIntegrationTest(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository,
            SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository
    ) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
        this.solicitacaoProfissionalSelecionadoRepository = solicitacaoProfissionalSelecionadoRepository;
    }

    @Test
    void clienteAutenticadaCriaListaVisualizaECancelaSolicitacao() throws Exception {
        String token = criarClienteELogar("m3a.crud@example.com");
        Long enderecoId = criarEndereco(token);
        Long regiaoId = primeiraRegiaoId();

        Long solicitacaoId = criarSolicitacao(token, enderecoId, regiaoId, "FAXINA_RESIDENCIAL");

        mockMvc.perform(get("/api/v1/solicitacoes/minhas")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(solicitacaoId))
                .andExpect(jsonPath("$.data[0].status").value("CRIADA"));

        mockMvc.perform(get("/api/v1/solicitacoes/{id}", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(solicitacaoId))
                .andExpect(jsonPath("$.data.enderecoId").value(enderecoId))
                .andExpect(jsonPath("$.data.regiaoId").value(regiaoId))
                .andExpect(jsonPath("$.data.tipoServico").value("FAXINA_RESIDENCIAL"));

        mockMvc.perform(patch("/api/v1/solicitacoes/{id}/cancelar", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(solicitacaoId))
                .andExpect(jsonPath("$.data.status").value("CANCELADA"));
    }

    @Test
    void clientePodeCriarSolicitacaoComTodosOsTiposDeServicoDocumentados() throws Exception {
        String token = criarClienteELogar("m3a.tipos@example.com");
        Long enderecoId = criarEndereco(token);
        Long regiaoId = primeiraRegiaoId();

        criarSolicitacao(token, enderecoId, regiaoId, "FAXINA_RESIDENCIAL");
        criarSolicitacao(token, enderecoId, regiaoId, "FAXINA_COMERCIAL");
        criarSolicitacao(token, enderecoId, regiaoId, "FAXINA_CONDOMINIO");
        criarSolicitacao(token, enderecoId, regiaoId, "FAXINA_EVENTO");

        mockMvc.perform(get("/api/v1/solicitacoes/minhas")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(4));
    }

    @Test
    void usuarioNaoVisualizaNemCancelaSolicitacaoDeOutraCliente() throws Exception {
        String tokenDona = criarClienteELogar("m3a.dona@example.com");
        String tokenOutra = criarClienteELogar("m3a.outra@example.com");
        Long solicitacaoId = criarSolicitacao(tokenDona, criarEndereco(tokenDona), primeiraRegiaoId(), "FAXINA_RESIDENCIAL");

        mockMvc.perform(get("/api/v1/solicitacoes/{id}", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOutra))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("SOLICITACAO_NOT_FOUND"))
                .andExpect(jsonPath("$.errors").isArray());

        mockMvc.perform(patch("/api/v1/solicitacoes/{id}/cancelar", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOutra))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("SOLICITACAO_NOT_FOUND"));
    }

    @Test
    void profissionalNaoCriaSolicitacaoComoCliente() throws Exception {
        String tokenProfissional = criarProfissionalELogar("m3a.profissional@example.com", "60122233344");
        Long enderecoId = criarEndereco(tokenProfissional);

        mockMvc.perform(post("/api/v1/solicitacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitacaoJson(enderecoId, primeiraRegiaoId(), "FAXINA_RESIDENCIAL")))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void enderecoSelecionadoDevePertencerAClienteAutenticada() throws Exception {
        String tokenDonaEndereco = criarClienteELogar("m3a.endereco-dona@example.com");
        String tokenOutra = criarClienteELogar("m3a.endereco-outra@example.com");
        Long enderecoDeOutraCliente = criarEndereco(tokenDonaEndereco);

        mockMvc.perform(post("/api/v1/solicitacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOutra)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitacaoJson(enderecoDeOutraCliente, primeiraRegiaoId(), "FAXINA_RESIDENCIAL")))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("ENDERECO_NOT_FOUND"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void endpointsDeSolicitacaoExigemJwt() throws Exception {
        mockMvc.perform(get("/api/v1/solicitacoes/minhas"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void validacaoMantemContratoDeErroJson() throws Exception {
        String token = criarClienteELogar("m3a.validacao@example.com");

        mockMvc.perform(post("/api/v1/solicitacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "enderecoId": null,
                                  "regiaoId": null,
                                  "dataHoraDesejada": "2020-01-01T10:00:00-03:00",
                                  "duracaoEstimadaHoras": 0,
                                  "tipoServico": null,
                                  "valorServico": null,
                                  "percentualComissaoAgencia": null,
                                  "valorEstimadoProfissional": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void clienteDonaListaSomenteProfissionaisElegiveisParaSolicitacao() throws Exception {
        String tokenCliente = criarClienteELogar("m3b.dona@example.com");
        Long regiaoSolicitacaoId = primeiraRegiaoId();
        Long outraRegiaoId = segundaRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoSolicitacaoId, "FAXINA_RESIDENCIAL");

        Long elegivelId = criarProfissionalConfigurada(
                "m3b.elegivel@example.com",
                "70122233344",
                "Profissional Elegivel",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.conta-inativa@example.com",
                "70222233344",
                "Profissional Conta Inativa",
                "INATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.perfil-pendente@example.com",
                "70322233344",
                "Profissional Perfil Pendente",
                "ATIVA",
                "PENDENTE",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.verificacao-pendente@example.com",
                "70422233344",
                "Profissional Verificacao Pendente",
                "ATIVA",
                "APROVADO",
                true,
                "PENDENTE",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.fora-regiao@example.com",
                "70522233344",
                "Profissional Fora Regiao",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(outraRegiaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.inativa-chamados@example.com",
                "70622233344",
                "Profissional Chamados Inativos",
                "ATIVA",
                "APROVADO",
                false,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        criarProfissionalConfigurada(
                "m3b.sem-disponibilidade@example.com",
                "70722233344",
                "Profissional Sem Disponibilidade",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "12:30",
                "16:00"
        );

        mockMvc.perform(get("/api/v1/solicitacoes/{id}/profissionais-disponiveis", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].profissionalId").value(elegivelId))
                .andExpect(jsonPath("$.data[0].nomeExibicao").value("Profissional Elegivel"))
                .andExpect(jsonPath("$.data[0].fotoPerfilUrl").doesNotExist())
                .andExpect(jsonPath("$.data[0].experienciaAnos").value(3))
                .andExpect(jsonPath("$.data[0].notaMedia").value(0))
                .andExpect(jsonPath("$.data[0].totalAvaliacoes").value(0));
    }

    @Test
    void clienteDonaListaProfissionaisConsiderandoVerificacaoEfetivaMaisRecente() throws Exception {
        String tokenCliente = criarClienteELogar("m3b.verificacao-efetiva-cliente@example.com");
        String tokenAdmin = login("admin@leidycleaner.local", "Admin123!local");
        Long regiaoSolicitacaoId = segundaRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoSolicitacaoId, "FAXINA_RESIDENCIAL");

        ProfissionalConfigurada aprovadaAtual = criarProfissionalConfiguradaComToken(
                "m3b.verificacao-atual-aprovada@example.com",
                "71322233344",
                "Profissional Aprovada Atual",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        ProfissionalConfigurada aprovadaDepoisRejeitada = criarProfissionalConfiguradaComToken(
                "m3b.verificacao-rejeitada@example.com",
                "71422233344",
                "Profissional Rejeitada Atual",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        adicionarDocumentoVerificacaoAnalisado(aprovadaDepoisRejeitada.tokenProfissional(), tokenAdmin, "REJEITADO");

        ProfissionalConfigurada aprovadaDepoisEmAnalise = criarProfissionalConfiguradaComToken(
                "m3b.verificacao-em-analise@example.com",
                "71522233344",
                "Profissional Em Analise Atual",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );
        adicionarDocumentoVerificacaoAnalisado(aprovadaDepoisEmAnalise.tokenProfissional(), tokenAdmin, "EM_ANALISE");

        ProfissionalConfigurada semAprovacaoEfetiva = criarProfissionalConfiguradaComToken(
                "m3b.verificacao-sem-aprovacao@example.com",
                "71622233344",
                "Profissional Sem Aprovacao Efetiva",
                "ATIVA",
                "APROVADO",
                true,
                "PENDENTE",
                List.of(regiaoSolicitacaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );

        String response = mockMvc.perform(get("/api/v1/solicitacoes/{id}/profissionais-disponiveis", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<Long> idsRetornados = objectMapper.readTree(response)
                .path("data")
                .findValues("profissionalId")
                .stream()
                .map(JsonNode::asLong)
                .toList();

        assertThat(idsRetornados)
                .contains(aprovadaAtual.perfilId())
                .doesNotContain(
                        aprovadaDepoisRejeitada.perfilId(),
                        aprovadaDepoisEmAnalise.perfilId(),
                        semAprovacaoEfetiva.perfilId()
                );
    }

    @Test
    void clienteNaoListaProfissionaisDisponiveisDeSolicitacaoDeOutraCliente() throws Exception {
        String tokenDona = criarClienteELogar("m3b.dona-listagem@example.com");
        String tokenOutra = criarClienteELogar("m3b.outra-listagem@example.com");
        Long solicitacaoId = criarSolicitacao(tokenDona, criarEndereco(tokenDona), primeiraRegiaoId(), "FAXINA_RESIDENCIAL");

        mockMvc.perform(get("/api/v1/solicitacoes/{id}/profissionais-disponiveis", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOutra))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("SOLICITACAO_NOT_FOUND"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void profissionalNaoUsaFluxoClienteParaListarElegiveis() throws Exception {
        String tokenCliente = criarClienteELogar("m3b.cliente-fluxo@example.com");
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), primeiraRegiaoId(), "FAXINA_RESIDENCIAL");
        String tokenProfissional = criarProfissionalELogar("m3b.profissional-fluxo@example.com", "70822233344");

        mockMvc.perform(get("/api/v1/solicitacoes/{id}/profissionais-disponiveis", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void endpointDeProfissionaisDisponiveisExigeJwt() throws Exception {
        mockMvc.perform(get("/api/v1/solicitacoes/1/profissionais-disponiveis"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void clienteDonaPersisteSelecaoValidaDeUmaProfissional() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.selecao-uma-cliente@example.com");
        Long regiaoId = primeiraRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoId, "FAXINA_RESIDENCIAL");
        Long profissionalId = criarProfissionalConfigurada(
                "m3c.selecao-uma-profissional@example.com",
                "72122233344",
                "Profissional Selecao Uma",
                "ATIVA",
                "APROVADO",
                true,
                "APROVADO",
                List.of(regiaoId),
                "QUINTA",
                "08:00",
                "12:00"
        );

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(profissionalId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.solicitacaoId").value(solicitacaoId))
                .andExpect(jsonPath("$.data.selecionados.length()").value(1))
                .andExpect(jsonPath("$.data.selecionados[0].profissionalId").value(profissionalId))
                .andExpect(jsonPath("$.data.selecionados[0].ordemEscolha").value(1));
    }

    @Test
    void clienteDonaPersisteSelecaoValidaDeTresProfissionaisNaOrdemInformada() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.selecao-tres-cliente@example.com");
        Long regiaoId = segundaRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoId, "FAXINA_RESIDENCIAL");
        Long primeira = criarProfissionalConfigurada("m3c.ordem-primeira@example.com", "72222233344", "Profissional Ordem Primeira", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");
        Long segunda = criarProfissionalConfigurada("m3c.ordem-segunda@example.com", "72322233344", "Profissional Ordem Segunda", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");
        Long terceira = criarProfissionalConfigurada("m3c.ordem-terceira@example.com", "72422233344", "Profissional Ordem Terceira", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(segunda, terceira, primeira))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.selecionados.length()").value(3))
                .andExpect(jsonPath("$.data.selecionados[0].profissionalId").value(segunda))
                .andExpect(jsonPath("$.data.selecionados[0].ordemEscolha").value(1))
                .andExpect(jsonPath("$.data.selecionados[1].profissionalId").value(terceira))
                .andExpect(jsonPath("$.data.selecionados[1].ordemEscolha").value(2))
                .andExpect(jsonPath("$.data.selecionados[2].profissionalId").value(primeira))
                .andExpect(jsonPath("$.data.selecionados[2].ordemEscolha").value(3));

        var persistidos = solicitacaoProfissionalSelecionadoRepository.findBySolicitacaoIdOrderByOrdemEscolhaAsc(solicitacaoId);
        assertThat(persistidos)
                .extracting(selecionado -> selecionado.getProfissional().getId())
                .containsExactly(segunda, terceira, primeira);
        assertThat(persistidos)
                .extracting("ordemEscolha")
                .containsExactly(1, 2, 3);
    }

    @Test
    void clienteDonaSubstituiSelecaoAnteriorAoEnviarNovaSelecao() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.substitui-cliente@example.com");
        Long regiaoId = primeiraRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoId, "FAXINA_RESIDENCIAL");
        Long primeira = criarProfissionalConfigurada("m3c.substitui-primeira@example.com", "72522233344", "Profissional Substitui Primeira", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");
        Long segunda = criarProfissionalConfigurada("m3c.substitui-segunda@example.com", "72622233344", "Profissional Substitui Segunda", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");
        Long terceira = criarProfissionalConfigurada("m3c.substitui-terceira@example.com", "72722233344", "Profissional Substitui Terceira", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");

        selecionarProfissionais(tokenCliente, solicitacaoId, List.of(primeira, segunda));
        selecionarProfissionais(tokenCliente, solicitacaoId, List.of(terceira));

        var persistidos = solicitacaoProfissionalSelecionadoRepository.findBySolicitacaoIdOrderByOrdemEscolhaAsc(solicitacaoId);
        assertThat(persistidos).hasSize(1);
        assertThat(persistidos.getFirst().getProfissional().getId()).isEqualTo(terceira);
        assertThat(persistidos.getFirst().getOrdemEscolha()).isEqualTo(1);
    }

    @Test
    void selecaoSemProfissionaisOuComMaisDeTresMantemContratoDeErroJson() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.validacao-cliente@example.com");
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), primeiraRegiaoId(), "FAXINA_RESIDENCIAL");

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of())))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors").isArray());

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(1L, 2L, 3L, 4L))))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void selecaoComProfissionaisDuplicadosERejeitada() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.duplicada-cliente@example.com");
        Long regiaoId = primeiraRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoId, "FAXINA_RESIDENCIAL");
        Long profissionalId = criarProfissionalConfigurada("m3c.duplicada-profissional@example.com", "72822233344", "Profissional Duplicada", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(profissionalId, profissionalId))))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("SELECAO_DUPLICADA"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void selecaoComProfissionalNaoElegivelOuNaoEncontradaERejeitada() throws Exception {
        String tokenCliente = criarClienteELogar("m3c.nao-elegivel-cliente@example.com");
        Long regiaoId = primeiraRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenCliente, criarEndereco(tokenCliente), regiaoId, "FAXINA_RESIDENCIAL");
        Long naoElegivelId = criarProfissionalConfigurada("m3c.nao-elegivel-profissional@example.com", "72922233344", "Profissional Nao Elegivel", "ATIVA", "APROVADO", true, "PENDENTE", List.of(regiaoId), "QUINTA", "08:00", "12:00");

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(naoElegivelId))))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PROFISSIONAL_NAO_ELEGIVEL"))
                .andExpect(jsonPath("$.errors").isArray());

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(999999999L))))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("PROFISSIONAL_NOT_FOUND"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void clienteNaoSelecionaProfissionaisParaSolicitacaoDeOutraCliente() throws Exception {
        String tokenDona = criarClienteELogar("m3c.dona-selecao@example.com");
        String tokenOutra = criarClienteELogar("m3c.outra-selecao@example.com");
        Long regiaoId = segundaRegiaoId();
        Long solicitacaoId = criarSolicitacao(tokenDona, criarEndereco(tokenDona), regiaoId, "FAXINA_RESIDENCIAL");
        Long profissionalId = criarProfissionalConfigurada("m3c.nao-dona-profissional@example.com", "73022233344", "Profissional Nao Dona", "ATIVA", "APROVADO", true, "APROVADO", List.of(regiaoId), "QUINTA", "08:00", "12:00");

        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenOutra)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(profissionalId))))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("SOLICITACAO_NOT_FOUND"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void endpointDeSelecaoExigeJwt() throws Exception {
        mockMvc.perform(post("/api/v1/solicitacoes/1/selecionados")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(List.of(1L))))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    private Long criarSolicitacao(String token, Long enderecoId, Long regiaoId, String tipoServico) throws Exception {
        String response = mockMvc.perform(post("/api/v1/solicitacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(solicitacaoJson(enderecoId, regiaoId, tipoServico)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CRIADA"))
                .andExpect(jsonPath("$.data.tipoServico").value(tipoServico))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private Long criarEndereco(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/enderecos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "cep": "90010-000",
                                  "logradouro": "Rua da Solicitacao",
                                  "numero": "123",
                                  "bairro": "Centro Histórico",
                                  "cidade": "Porto Alegre",
                                  "estado": "RS",
                                  "principal": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private String criarClienteELogar(String email) throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Cliente Solicitacao",
                                  "email": "%s",
                                  "telefone": "+5551999998888",
                                  "senha": "senha-segura-123"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated());

        return login(email, "senha-segura-123");
    }

    private String criarProfissionalELogar(String email, String cpf) throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/profissionais")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Profissional Solicitacao",
                                  "email": "%s",
                                  "telefone": "+5551988887777",
                                  "senha": "senha-segura-123",
                                  "nomeExibicao": "Profissional Solicitacao",
                                  "cpf": "%s",
                                  "dataNascimento": "1990-03-20"
                                }
                                """.formatted(email, cpf)))
                .andExpect(status().isCreated());

        return login(email, "senha-segura-123");
    }

    private Long criarProfissionalConfigurada(
            String email,
            String cpf,
            String nomeExibicao,
            String statusConta,
            String statusAprovacao,
            boolean ativoParaReceberChamados,
            String statusVerificacao,
            List<Long> regiaoIds,
            String diaSemana,
            String horaInicio,
            String horaFim
    ) throws Exception {
        return criarProfissionalConfiguradaComToken(
                email,
                cpf,
                nomeExibicao,
                statusConta,
                statusAprovacao,
                ativoParaReceberChamados,
                statusVerificacao,
                regiaoIds,
                diaSemana,
                horaInicio,
                horaFim
        ).perfilId();
    }

    private ProfissionalConfigurada criarProfissionalConfiguradaComToken(
            String email,
            String cpf,
            String nomeExibicao,
            String statusConta,
            String statusAprovacao,
            boolean ativoParaReceberChamados,
            String statusVerificacao,
            List<Long> regiaoIds,
            String diaSemana,
            String horaInicio,
            String horaFim
    ) throws Exception {
        String tokenProfissional = cadastrarProfissional(email, cpf, nomeExibicao);
        Long perfilId = buscarMeuPerfilProfissionalId(tokenProfissional);
        String tokenAdmin = login("admin@leidycleaner.local", "Admin123!local");

        mockMvc.perform(patch("/api/v1/profissionais/{id}/aprovacao", perfilId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusAprovacao": "%s"
                                }
                                """.formatted(statusAprovacao)))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/profissionais/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeExibicao": "%s",
                                  "descricao": "Profissional preparada para seleção",
                                  "experienciaAnos": 3,
                                  "ativoParaReceberChamados": %s
                                }
                                """.formatted(nomeExibicao, ativoParaReceberChamados)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/profissionais/me/regioes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "regiaoIds": %s
                                }
                                """.formatted(objectMapper.writeValueAsString(regiaoIds))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/profissionais/me/disponibilidades")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "diaSemana": "%s",
                                  "horaInicio": "%s",
                                  "horaFim": "%s",
                                  "ativo": true
                                }
                                """.formatted(diaSemana, horaInicio, horaFim)))
                .andExpect(status().isCreated());

        Long documentoId = submeterDocumentoVerificacao(tokenProfissional);
        mockMvc.perform(patch("/api/v1/verificacoes/{id}/analisar", documentoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusVerificacao": "%s",
                                  "observacaoAnalise": "Ajuste para teste de elegibilidade"
                                }
                                """.formatted(statusVerificacao)))
                .andExpect(status().isOk());

        Long usuarioId = buscarUsuarioAutenticadoId(tokenProfissional);
        mockMvc.perform(patch("/api/v1/usuarios/{id}/status", usuarioId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusConta": "%s"
                        }
                        """.formatted(statusConta)))
                .andExpect(status().isOk());

        return new ProfissionalConfigurada(perfilId, tokenProfissional);
    }

    private String cadastrarProfissional(String email, String cpf, String nomeExibicao) throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/profissionais")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "%s",
                                  "email": "%s",
                                  "telefone": "+5551988889999",
                                  "senha": "senha-segura-123",
                                  "nomeExibicao": "%s",
                                  "cpf": "%s",
                                  "dataNascimento": "1990-03-20"
                                }
                                """.formatted(nomeExibicao, email, nomeExibicao, cpf)))
                .andExpect(status().isCreated());
        return login(email, "senha-segura-123");
    }

    private Long buscarMeuPerfilProfissionalId(String tokenProfissional) throws Exception {
        String response = mockMvc.perform(get("/api/v1/profissionais/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private Long buscarUsuarioAutenticadoId(String token) throws Exception {
        String response = mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private Long submeterDocumentoVerificacao(String tokenProfissional) throws Exception {
        String response = mockMvc.perform(post("/api/v1/verificacoes/documentos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenProfissional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipoDocumento": "CPF",
                                  "numeroDocumento": "12345678901",
                                  "documentoFrenteUrl": "local/documentos/frente.png",
                                  "documentoVersoUrl": "local/documentos/verso.png",
                                  "selfieUrl": "local/documentos/selfie.png",
                                  "comprovanteResidenciaUrl": "local/documentos/comprovante.png"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private void adicionarDocumentoVerificacaoAnalisado(String tokenProfissional, String tokenAdmin, String statusVerificacao) throws Exception {
        Long documentoId = submeterDocumentoVerificacao(tokenProfissional);
        mockMvc.perform(patch("/api/v1/verificacoes/{id}/analisar", documentoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusVerificacao": "%s",
                                  "observacaoAnalise": "Documento posterior para teste de verificacao efetiva"
                                }
                                """.formatted(statusVerificacao)))
                .andExpect(status().isOk());
    }

    private void selecionarProfissionais(String tokenCliente, Long solicitacaoId, List<Long> profissionalIds) throws Exception {
        mockMvc.perform(post("/api/v1/solicitacoes/{id}/selecionados", solicitacaoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenCliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(selecaoJson(profissionalIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private String selecaoJson(List<Long> profissionalIds) throws Exception {
        return """
                {
                  "profissionalIds": %s
                }
                """.formatted(objectMapper.writeValueAsString(profissionalIds));
    }

    private String login(String email, String senha) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "senha": "%s"
                                }
                                """.formatted(email, senha)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode root = objectMapper.readTree(response);
        return root.path("data").path("accessToken").asText();
    }

    private Long primeiraRegiaoId() {
        return regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc().get(0).getId();
    }

    private Long segundaRegiaoId() {
        return regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc().get(1).getId();
    }

    private String solicitacaoJson(Long enderecoId, Long regiaoId, String tipoServico) {
        return """
                {
                  "enderecoId": %d,
                  "regiaoId": %d,
                  "dataHoraDesejada": "2035-05-10T10:00:00-03:00",
                  "duracaoEstimadaHoras": 4,
                  "tipoServico": "%s",
                  "observacoes": "Limpeza solicitada pela cliente",
                  "valorServico": 180.00,
                  "percentualComissaoAgencia": 20.00,
                  "valorEstimadoProfissional": 144.00
                }
                """.formatted(enderecoId, regiaoId, tipoServico);
    }
}
