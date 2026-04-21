package br.com.leidycleaner.profissionais;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;
import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;
import br.com.leidycleaner.verificacao.repository.DocumentoVerificacaoRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfissionalOnboardingIntegrationTest {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final DocumentoVerificacaoRepository documentoVerificacaoRepository;

    @Autowired
    ProfissionalOnboardingIntegrationTest(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository,
            PerfilProfissionalRepository perfilProfissionalRepository,
            DocumentoVerificacaoRepository documentoVerificacaoRepository
    ) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.documentoVerificacaoRepository = documentoVerificacaoRepository;
    }

    @Test
    void flywayCriaSeedInicialDeRegioesPortoAlegre() {
        assertThat(regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc())
                .extracting(RegiaoAtendimento::getNome)
                .contains("Centro Histórico", "Cidade Baixa", "Menino Deus", "Restinga");
    }

    @Test
    void profissionalDefineEListaAsPropriasRegioes() throws Exception {
        String token = criarProfissionalELogar("m2a.regioes@example.com", "50122233344");
        List<RegiaoAtendimento> regioes = regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc();
        Long primeiraRegiaoId = regioes.getFirst().getId();
        Long segundaRegiaoId = regioes.get(1).getId();

        mockMvc.perform(post("/api/v1/profissionais/me/regioes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "regiaoIds": [%d, %d]
                                }
                                """.formatted(primeiraRegiaoId, segundaRegiaoId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));

        mockMvc.perform(get("/api/v1/profissionais/me/regioes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void profissionalGerenciaAsPropriasDisponibilidades() throws Exception {
        String token = criarProfissionalELogar("m2a.disponibilidade@example.com", "50222233344");

        Long disponibilidadeId = criarDisponibilidade(token, "SEGUNDA", "08:00", "12:00");

        mockMvc.perform(get("/api/v1/profissionais/me/disponibilidades")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].diaSemana").value("SEGUNDA"));

        mockMvc.perform(put("/api/v1/profissionais/me/disponibilidades/{id}", disponibilidadeId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "diaSemana": "TERCA",
                                  "horaInicio": "09:00",
                                  "horaFim": "13:00",
                                  "ativo": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.diaSemana").value("TERCA"))
                .andExpect(jsonPath("$.data.ativo").value(false));

        mockMvc.perform(delete("/api/v1/profissionais/me/disponibilidades/{id}", disponibilidadeId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/profissionais/me/disponibilidades")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void disponibilidadeInvalidaMantemContratoDeErroJson() throws Exception {
        String token = criarProfissionalELogar("m2a.disponibilidade-invalida@example.com", "50322233344");

        mockMvc.perform(post("/api/v1/profissionais/me/disponibilidades")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "diaSemana": "QUARTA",
                                  "horaInicio": "14:00",
                                  "horaFim": "12:00",
                                  "ativo": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("HORARIO_INVALIDO"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void profissionalSubmeteEConsultaAPropriaVerificacao() throws Exception {
        String email = "m2a.verificacao@example.com";
        String token = criarProfissionalELogar(email, "50422233344");

        Long documentoId = submeterDocumento(token);

        mockMvc.perform(get("/api/v1/verificacoes/minha")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(documentoId))
                .andExpect(jsonPath("$.data.statusVerificacao").value("PENDENTE"));
    }

    @Test
    void adminListaLeEAnalisaVerificacoes() throws Exception {
        String tokenProfissional = criarProfissionalELogar("m2a.verificacao-admin@example.com", "50522233344");
        Long documentoId = submeterDocumento(tokenProfissional);
        String tokenAdmin = login("admin@leidycleaner.local", "Admin123!local");

        mockMvc.perform(get("/api/v1/verificacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").isNumber());

        mockMvc.perform(get("/api/v1/verificacoes/{id}", documentoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(documentoId));

        mockMvc.perform(patch("/api/v1/verificacoes/{id}/analisar", documentoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusVerificacao": "APROVADO",
                                  "observacaoAnalise": "Documentação validada"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statusVerificacao").value("APROVADO"))
                .andExpect(jsonPath("$.data.analisadoPorUsuarioId").isNumber())
                .andExpect(jsonPath("$.data.analisadoEm").isString());
    }

    @Test
    void adminAprovaProfissional() throws Exception {
        String email = "m2a.aprovacao@example.com";
        criarProfissionalELogar(email, "50622233344");
        Long perfilId = perfilProfissionalRepository.findByCpf("50622233344").orElseThrow().getId();
        String tokenAdmin = login("admin@leidycleaner.local", "Admin123!local");

        mockMvc.perform(patch("/api/v1/profissionais/{id}/aprovacao", perfilId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusAprovacao": "APROVADO"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(perfilId))
                .andExpect(jsonPath("$.data.statusAprovacao").value("APROVADO"));
    }

    @Test
    void naoAdminNaoAcessaEndpointsAdministrativosDeVerificacao() throws Exception {
        String token = criarProfissionalELogar("m2a.nao-admin@example.com", "50722233344");

        mockMvc.perform(get("/api/v1/verificacoes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void endpointsDeOnboardingExigemJwt() throws Exception {
        mockMvc.perform(get("/api/v1/profissionais/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void comportamentoDeLoginEAuthMePermaneceFuncionando() throws Exception {
        String email = "m2a.authme@example.com";
        String token = criarProfissionalELogar(email, "50822233344");

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.tipoUsuario").value("PROFISSIONAL"));
    }

    private String criarProfissionalELogar(String email, String cpf) throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/profissionais")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Profissional M2A",
                                  "email": "%s",
                                  "telefone": "+5551988885555",
                                  "senha": "senha-segura-123",
                                  "nomeExibicao": "Profissional M2A",
                                  "cpf": "%s",
                                  "dataNascimento": "1990-03-20",
                                  "descricao": "Atendimento residencial",
                                  "experienciaAnos": 3
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

    private Long criarDisponibilidade(String token, String diaSemana, String horaInicio, String horaFim) throws Exception {
        String response = mockMvc.perform(post("/api/v1/profissionais/me/disponibilidades")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "diaSemana": "%s",
                                  "horaInicio": "%s",
                                  "horaFim": "%s",
                                  "ativo": true
                                }
                                """.formatted(diaSemana, horaInicio, horaFim)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode root = objectMapper.readTree(response);
        return root.path("data").path("id").asLong();
    }

    private Long submeterDocumento(String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/verificacoes/documentos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
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
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.statusVerificacao").value("PENDENTE"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(response);
        Long documentoId = root.path("data").path("id").asLong();
        assertThat(documentoVerificacaoRepository.findById(documentoId)).isPresent();
        return documentoId;
    }
}
