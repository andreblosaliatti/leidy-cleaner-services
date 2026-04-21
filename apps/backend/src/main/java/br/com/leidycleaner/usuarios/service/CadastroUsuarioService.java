package br.com.leidycleaner.usuarios.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.auth.dto.UsuarioAutenticadoDto;
import br.com.leidycleaner.auth.entity.Role;
import br.com.leidycleaner.auth.entity.RoleName;
import br.com.leidycleaner.auth.mapper.AuthMapper;
import br.com.leidycleaner.auth.service.RoleService;
import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.usuarios.dto.CadastroClienteRequest;
import br.com.leidycleaner.usuarios.dto.CadastroProfissionalRequest;
import br.com.leidycleaner.usuarios.dto.CadastroUsuarioResponse;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class CadastroUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public CadastroUsuarioService(
            UsuarioRepository usuarioRepository,
            PerfilClienteRepository perfilClienteRepository,
            PerfilProfissionalRepository perfilProfissionalRepository,
            RoleService roleService,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.perfilClienteRepository = perfilClienteRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CadastroUsuarioResponse cadastrarCliente(CadastroClienteRequest request) {
        String email = normalizarEmail(request.email());
        validarEmailDisponivel(email);

        Usuario usuario = criarUsuarioBase(
                request.nomeCompleto(),
                email,
                request.telefone(),
                request.senha(),
                TipoUsuario.CLIENTE,
                StatusConta.ATIVA,
                RoleName.ROLE_CLIENTE
        );

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        PerfilCliente perfil = perfilClienteRepository.save(new PerfilCliente(usuarioSalvo, request.observacoesInternas()));

        return new CadastroUsuarioResponse(AuthMapper.paraUsuarioAutenticado(usuarioSalvo), perfil.getId());
    }

    @Transactional
    public CadastroUsuarioResponse cadastrarProfissional(CadastroProfissionalRequest request) {
        String email = normalizarEmail(request.email());
        String cpf = normalizarCpf(request.cpf());
        validarEmailDisponivel(email);
        if (perfilProfissionalRepository.existsByCpf(cpf)) {
            throw new BusinessException("CPF_ALREADY_EXISTS", "CPF ja cadastrado");
        }

        Usuario usuario = criarUsuarioBase(
                request.nomeCompleto(),
                email,
                request.telefone(),
                request.senha(),
                TipoUsuario.PROFISSIONAL,
                StatusConta.PENDENTE_VERIFICACAO,
                RoleName.ROLE_PROFISSIONAL
        );

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        PerfilProfissional perfil = perfilProfissionalRepository.save(new PerfilProfissional(
                usuarioSalvo,
                request.nomeExibicao().trim(),
                cpf,
                request.dataNascimento(),
                request.descricao(),
                request.fotoPerfilUrl(),
                request.experienciaAnos() == null ? 0 : request.experienciaAnos(),
                false,
                StatusAprovacaoProfissional.PENDENTE
        ));

        return new CadastroUsuarioResponse(AuthMapper.paraUsuarioAutenticado(usuarioSalvo), perfil.getId());
    }

    private Usuario criarUsuarioBase(
            String nomeCompleto,
            String email,
            String telefone,
            String senha,
            TipoUsuario tipoUsuario,
            StatusConta statusConta,
            RoleName roleName
    ) {
        Role role = roleService.buscarObrigatoria(roleName);
        Usuario usuario = new Usuario(
                nomeCompleto.trim(),
                email,
                telefone.trim(),
                passwordEncoder.encode(senha),
                tipoUsuario,
                statusConta
        );
        usuario.adicionarRole(role);
        return usuario;
    }

    private void validarEmailDisponivel(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Email ja cadastrado");
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizarCpf(String cpf) {
        return cpf.replaceAll("\\D", "");
    }
}
