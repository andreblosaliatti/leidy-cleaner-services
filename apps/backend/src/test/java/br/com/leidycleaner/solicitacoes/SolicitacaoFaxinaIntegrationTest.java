package br.com.leidycleaner.solicitacoes;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SolicitacaoFaxinaIntegrationTest {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;

    @Autowired
    SolicitacaoFaxinaIntegrationTest(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository
    ) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
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
