package br.com.leidycleaner.notificacoes;

import static br.com.leidycleaner.support.TestAceites.camposAceiteJson;
import static br.com.leidycleaner.support.TestCpf.cpfComPrefixo;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.leidycleaner.notificacoes.entity.PlataformaPush;
import br.com.leidycleaner.notificacoes.repository.DispositivoPushRepository;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;
import br.com.leidycleaner.verificacao.entity.DocumentoVerificacao;
import br.com.leidycleaner.verificacao.entity.StatusVerificacao;
import br.com.leidycleaner.verificacao.repository.DocumentoVerificacaoRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "firebase.enabled=false",
        "google.application.credentials="
})
class NotificacaoPushIntegrationTest {

    private static final String SENHA = "senha-segura-123";
    private static final AtomicInteger SEQUENCE = new AtomicInteger(1000);

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    private final UsuarioRepository usuarioRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final DocumentoVerificacaoRepository documentoVerificacaoRepository;
    private final DispositivoPushRepository dispositivoPushRepository;

    @Autowired
    NotificacaoPushIntegrationTest(
            MockMvc mockMvc,
            ObjectMapper objectMapper,
            UsuarioRepository usuarioRepository,
            PerfilProfissionalRepository perfilProfissionalRepository,
            DocumentoVerificacaoRepository documentoVerificacaoRepository,
            DispositivoPushRepository dispositivoPushRepository
    ) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
        this.usuarioRepository = usuarioRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.documentoVerificacaoRepository = documentoVerificacaoRepository;
        this.dispositivoPushRepository = dispositivoPushRepository;
    }

    @Test
    void profissionalRegistraDispositivoAndroid() throws Exception {
        AuthSession sessao = criarProfissionalELogar("push.profissional.registra");

        mockMvc.perform(post("/api/v1/notificacoes/dispositivos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessao.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plataforma": "ANDROID",
                                  "token": "fcm-token-profissional-registra-123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.plataforma").value("ANDROID"))
                .andExpect(jsonPath("$.data.ativo").value(true))
                .andExpect(jsonPath("$.data.tokenMascarado").value("fcm-to...-123"));
    }

    @Test
    void registrarMesmoTokenReativaRegistroExistenteSemDuplicar() throws Exception {
        AuthSession sessao = criarProfissionalELogar("push.profissional.duplica");
        String pushToken = "fcm-token-reutilizado-456";
        Long primeiroId = registrarDispositivo(sessao.token(), pushToken);

        mockMvc.perform(delete("/api/v1/notificacoes/dispositivos/{id}", primeiroId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessao.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ativo").value(false));

        Long segundoId = registrarDispositivo(sessao.token(), pushToken);

        Usuario usuario = usuarioRepository.findByEmail(sessao.email()).orElseThrow();
        assertThat(segundoId).isEqualTo(primeiroId);
        assertThat(dispositivoPushRepository.countByUsuario_IdAndPlataformaAndToken(
                usuario.getId(),
                PlataformaPush.ANDROID,
                pushToken
        )).isEqualTo(1);
        assertThat(dispositivoPushRepository.findById(primeiroId).orElseThrow().isAtivo()).isTrue();
    }

    @Test
    void profissionalNaoDesativaDispositivoDeOutraProfissional() throws Exception {
        AuthSession sessaoDona = criarProfissionalELogar("push.profissional.dona");
        AuthSession sessaoOutra = criarProfissionalELogar("push.profissional.outra");
        Long dispositivoId = registrarDispositivo(sessaoDona.token(), "fcm-token-dona-789");

        mockMvc.perform(delete("/api/v1/notificacoes/dispositivos/{id}", dispositivoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessaoOutra.token()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("DISPOSITIVO_PUSH_FORBIDDEN"));

        assertThat(dispositivoPushRepository.findById(dispositivoId).orElseThrow().isAtivo()).isTrue();
    }

    @Test
    void profissionalDesativaProprioDispositivo() throws Exception {
        AuthSession sessao = criarProfissionalELogar("push.profissional.desativa");
        Long dispositivoId = registrarDispositivo(sessao.token(), "fcm-token-desativa-000");

        mockMvc.perform(delete("/api/v1/notificacoes/dispositivos/{id}", dispositivoId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessao.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ativo").value(false));

        assertThat(dispositivoPushRepository.findById(dispositivoId).orElseThrow().isAtivo()).isFalse();
    }

    @Test
    void clienteNaoRegistraDispositivoProfissional() throws Exception {
        AuthSession sessaoCliente = criarClienteELogar("push.cliente.negado");

        mockMvc.perform(post("/api/v1/notificacoes/dispositivos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessaoCliente.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plataforma": "ANDROID",
                                  "token": "fcm-token-cliente-negado"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void envioTesteNaoExpoeTokenOuSegredos() throws Exception {
        AuthSession sessao = criarProfissionalELogar("push.profissional.teste");
        String pushToken = "fcm-token-super-secreto-999";
        registrarDispositivo(sessao.token(), pushToken);

        String response = mockMvc.perform(post("/api/v1/notificacoes/teste")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + sessao.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.providerConfigurado").value(false))
                .andExpect(jsonPath("$.data.totalDispositivos").value(1))
                .andExpect(jsonPath("$.data.enviados").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(response).doesNotContain(pushToken);
        assertThat(response.toLowerCase()).doesNotContain("firebase");
    }

    private Long registrarDispositivo(String authToken, String pushToken) throws Exception {
        String response = mockMvc.perform(post("/api/v1/notificacoes/dispositivos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plataforma": "ANDROID",
                                  "token": "%s"
                                }
                                """.formatted(pushToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asLong();
    }

    private AuthSession criarProfissionalELogar(String emailPrefixo) throws Exception {
        DadosCadastro dados = dadosCadastroUnicos(emailPrefixo, "+55519");

        mockMvc.perform(post("/api/v1/usuarios/profissionais")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Profissional Push",
                                  "email": "%s",
                                  "telefone": "%s",
                                  "senha": "%s",
                                  "nomeExibicao": "Profissional Push",
                                  "cpf": "%s",
                                  "dataNascimento": "1990-03-20",
                                  "descricao": "Atendimento residencial",
                                  "experienciaAnos": 3,
                                  %s
                                }
                                """.formatted(
                                dados.email(),
                                dados.telefone(),
                                SENHA,
                                dados.cpf(),
                                camposAceiteJson()
                        )))
                .andExpect(status().isCreated());

        liberarProfissionalParaLogin(dados.cpf());
        return new AuthSession(dados.email(), login(dados.email()));
    }

    private AuthSession criarClienteELogar(String emailPrefixo) throws Exception {
        DadosCadastro dados = dadosCadastroUnicos(emailPrefixo, "+55518");

        mockMvc.perform(post("/api/v1/usuarios/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nomeCompleto": "Cliente Push",
                                  "email": "%s",
                                  "telefone": "%s",
                                  "cpf": "%s",
                                  "senha": "%s",
                                  %s
                                }
                                """.formatted(
                                dados.email(),
                                dados.telefone(),
                                dados.cpf(),
                                SENHA,
                                camposAceiteJson()
                        )))
                .andExpect(status().isCreated());

        return new AuthSession(dados.email(), login(dados.email()));
    }

    private DadosCadastro dadosCadastroUnicos(String emailPrefixo, String telefonePrefixo) {
        String cpf = cpfComPrefixo(cpfBaseUnico());
        String telefone = telefonePrefixo + cpf.substring(0, 8);
        String email = emailUnico(emailPrefixo);

        return new DadosCadastro(email, cpf, telefone);
    }

    private String emailUnico(String emailPrefixo) {
        String prefixoSeguro = emailPrefixo.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return prefixoSeguro + SEQUENCE.getAndIncrement() + System.nanoTime() + "@example.com";
    }

    private String cpfBaseUnico() {
        long valor = Math.abs(System.nanoTime() + ThreadLocalRandom.current().nextLong(1_000_000L));
        int sequencia = SEQUENCE.getAndIncrement();

        return "9" + String.format("%010d", (valor + sequencia) % 10_000_000_000L);
    }

    private void liberarProfissionalParaLogin(String cpf) {
        Usuario admin = usuarioRepository.findByEmail("admin@leidycleaner.local").orElseThrow();
        var perfil = perfilProfissionalRepository.findByCpf(cpf).orElseThrow();

        perfil.alterarStatusAprovacao(StatusAprovacaoProfissional.APROVADO);
        perfil.getUsuario().alterarStatusConta(StatusConta.ATIVA);
        usuarioRepository.saveAndFlush(perfil.getUsuario());

        DocumentoVerificacao documento = new DocumentoVerificacao(
                perfil.getUsuario(),
                "CPF",
                cpf,
                "local/documentos/frente.png",
                "local/documentos/verso.png",
                "local/documentos/selfie.png",
                "local/documentos/comprovante.png"
        );

        documento.analisar(StatusVerificacao.APROVADO, "Liberado para teste", admin);
        documentoVerificacaoRepository.save(documento);
        perfilProfissionalRepository.saveAndFlush(perfil);
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "senha": "%s"
                                }
                                """.formatted(email, SENHA)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(response);
        return root.path("data").path("accessToken").asText();
    }

    private record AuthSession(String email, String token) {
    }

    private record DadosCadastro(String email, String cpf, String telefone) {
    }
}
