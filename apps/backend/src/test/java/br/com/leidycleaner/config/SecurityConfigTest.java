package br.com.leidycleaner.config;

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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    private final MockMvc mockMvc;

    @Autowired
    SecurityConfigTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void healthEndpointPermanecePublico() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void endpointNaoPublicoExigeAutenticacao() throws Exception {
        mockMvc.perform(get("/api/v1/protegido"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "success": false,
                          "code": "UNAUTHORIZED",
                          "message": "Autenticacao obrigatoria",
                          "errors": []
                        }
                        """));
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void endpointSemPermissaoRetornaContratoJson403() throws Exception {
        mockMvc.perform(patch("/api/v1/usuarios/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "statusConta": "BLOQUEADA"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("WWW-Authenticate"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "success": false,
                          "code": "FORBIDDEN",
                          "message": "Acesso negado",
                          "errors": []
                        }
                        """));
    }

    @Test
    void preCadastroCompletoComOriginLocalPermitidoRetorna400EmVezDe403() throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/profissionais/pre-cadastro-completo")
                        .header("Origin", "http://172.21.182.50:5173")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://172.21.182.50:5173"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void preCadastroCompletoComOriginLocalhostPermitidoRetorna400EmVezDe403() throws Exception {
        mockMvc.perform(post("/api/v1/usuarios/profissionais/pre-cadastro-completo")
                        .header("Origin", "http://localhost")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void preflightOptionsForProtectedEndpointWithCapacitorOriginReturnsCorsHeaders() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options("/api/v1/usuarios/1/status")
                        .header("Origin", "capacitor://localhost")
                        .header("Access-Control-Request-Method", "PATCH"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "capacitor://localhost"))
                .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS"))
                .andExpect(header().string("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,Origin"));
    }
}
