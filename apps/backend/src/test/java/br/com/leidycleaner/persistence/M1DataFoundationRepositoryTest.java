package br.com.leidycleaner.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.auth.entity.Role;
import br.com.leidycleaner.auth.entity.RoleName;
import br.com.leidycleaner.auth.repository.RoleRepository;
import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.clientes.mapper.PerfilClienteMapper;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class M1DataFoundationRepositoryTest {

    private final RoleRepository roleRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;

    @Autowired
    M1DataFoundationRepositoryTest(
            RoleRepository roleRepository,
            UsuarioRepository usuarioRepository,
            PerfilClienteRepository perfilClienteRepository,
            PerfilProfissionalRepository perfilProfissionalRepository
    ) {
        this.roleRepository = roleRepository;
        this.usuarioRepository = usuarioRepository;
        this.perfilClienteRepository = perfilClienteRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
    }

    @Test
    void flywayCriaSchemaESeedDasRolesBase() {
        assertThat(roleRepository.findAll())
                .extracting(Role::getNome)
                .containsExactlyInAnyOrder(
                        RoleName.ROLE_ADMIN,
                        RoleName.ROLE_CLIENTE,
                        RoleName.ROLE_PROFISSIONAL
                );
    }

    @Test
    void persisteUsuarioClienteComPerfil() {
        Role roleCliente = roleRepository.findByNome(RoleName.ROLE_CLIENTE).orElseThrow();
        Usuario usuario = new Usuario(
                "Cliente Teste",
                "cliente.teste@example.com",
                "+5551999990000",
                "$2a$10$hash-de-teste-nao-e-senha-crua",
                TipoUsuario.CLIENTE,
                StatusConta.ATIVA
        );
        usuario.adicionarRole(roleCliente);

        Usuario usuarioSalvo = usuarioRepository.saveAndFlush(usuario);
        PerfilCliente perfil = perfilClienteRepository.saveAndFlush(new PerfilCliente(usuarioSalvo, "Cadastro de teste"));

        assertThat(usuarioRepository.findByEmail("cliente.teste@example.com")).isPresent();
        assertThat(perfilClienteRepository.findByUsuarioId(usuarioSalvo.getId()))
                .contains(perfil);
        assertThat(PerfilClienteMapper.paraResumo(perfil).criadoEm()).isNotNull();
        assertThat(PerfilClienteMapper.paraResumo(perfil).atualizadoEm()).isNotNull();
    }

    @Test
    void persisteUsuarioProfissionalComPerfil() {
        Role roleProfissional = roleRepository.findByNome(RoleName.ROLE_PROFISSIONAL).orElseThrow();
        Usuario usuario = new Usuario(
                "Profissional Teste",
                "profissional.teste@example.com",
                "+5551988880000",
                "$2a$10$hash-de-teste-nao-e-senha-crua",
                TipoUsuario.PROFISSIONAL,
                StatusConta.PENDENTE_VERIFICACAO
        );
        usuario.adicionarRole(roleProfissional);

        Usuario usuarioSalvo = usuarioRepository.saveAndFlush(usuario);
        PerfilProfissional perfil = perfilProfissionalRepository.saveAndFlush(new PerfilProfissional(
                usuarioSalvo,
                "Profissional Teste",
                "12345678901",
                LocalDate.of(1990, 1, 15),
                null,
                null,
                0,
                false,
                StatusAprovacaoProfissional.PENDENTE
        ));

        assertThat(perfilProfissionalRepository.findByCpf("12345678901")).contains(perfil);
        assertThat(perfilProfissionalRepository.findByUsuarioId(usuarioSalvo.getId())).contains(perfil);
    }
}
