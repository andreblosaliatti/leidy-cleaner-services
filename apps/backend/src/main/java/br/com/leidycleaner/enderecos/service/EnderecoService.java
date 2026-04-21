package br.com.leidycleaner.enderecos.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.enderecos.dto.EnderecoDto;
import br.com.leidycleaner.enderecos.dto.EnderecoRequest;
import br.com.leidycleaner.enderecos.entity.Endereco;
import br.com.leidycleaner.enderecos.mapper.EnderecoMapper;
import br.com.leidycleaner.enderecos.repository.EnderecoRepository;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioRepository usuarioRepository;

    public EnderecoService(EnderecoRepository enderecoRepository, UsuarioRepository usuarioRepository) {
        this.enderecoRepository = enderecoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public EnderecoDto criar(Long usuarioId, EnderecoRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
        boolean primeiroEndereco = enderecoRepository.countByUsuarioId(usuarioId) == 0;
        boolean deveSerPrincipal = Boolean.TRUE.equals(request.principal()) || primeiroEndereco;

        if (deveSerPrincipal) {
            enderecoRepository.desmarcarPrincipaisDoUsuario(usuarioId);
        }

        Endereco endereco = new Endereco(
                usuario,
                request.cep(),
                request.logradouro(),
                request.numero(),
                request.complemento(),
                request.bairro(),
                request.cidade(),
                request.estado(),
                request.latitude(),
                request.longitude(),
                deveSerPrincipal
        );

        return EnderecoMapper.paraDto(enderecoRepository.save(endereco));
    }

    @Transactional(readOnly = true)
    public List<EnderecoDto> listarMeus(Long usuarioId) {
        return enderecoRepository.findByUsuarioIdOrderByPrincipalDescCriadoEmAscIdAsc(usuarioId)
                .stream()
                .map(EnderecoMapper::paraDto)
                .toList();
    }

    @Transactional
    public EnderecoDto atualizar(Long usuarioId, Long enderecoId, EnderecoRequest request) {
        Endereco endereco = buscarEnderecoDoUsuario(usuarioId, enderecoId);
        if (Boolean.TRUE.equals(request.principal())) {
            enderecoRepository.desmarcarPrincipaisDoUsuario(usuarioId);
            endereco.marcarComoPrincipal();
        } else if (Boolean.FALSE.equals(request.principal()) && enderecoRepository.countByUsuarioId(usuarioId) == 1) {
            endereco.marcarComoPrincipal();
        } else if (Boolean.FALSE.equals(request.principal()) && endereco.isPrincipal()) {
            endereco.desmarcarComoPrincipal();
            enderecoRepository.findFirstByUsuarioIdAndIdNotOrderByCriadoEmAscIdAsc(usuarioId, enderecoId)
                    .ifPresent(Endereco::marcarComoPrincipal);
        }

        endereco.atualizarDados(
                request.cep(),
                request.logradouro(),
                request.numero(),
                request.complemento(),
                request.bairro(),
                request.cidade(),
                request.estado(),
                request.latitude(),
                request.longitude()
        );

        return EnderecoMapper.paraDto(endereco);
    }

    @Transactional
    public void excluir(Long usuarioId, Long enderecoId) {
        Endereco endereco = buscarEnderecoDoUsuario(usuarioId, enderecoId);
        boolean eraPrincipal = endereco.isPrincipal();

        enderecoRepository.delete(endereco);
        enderecoRepository.flush();

        if (eraPrincipal) {
            enderecoRepository.findFirstByUsuarioIdOrderByCriadoEmAscIdAsc(usuarioId)
                    .ifPresent(Endereco::marcarComoPrincipal);
        }
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("USUARIO_NOT_FOUND", "Usuario nao encontrado", HttpStatus.NOT_FOUND));
    }

    private Endereco buscarEnderecoDoUsuario(Long usuarioId, Long enderecoId) {
        return enderecoRepository.findByIdAndUsuarioId(enderecoId, usuarioId)
                .orElseThrow(() -> new BusinessException("ENDERECO_NOT_FOUND", "Endereco nao encontrado", HttpStatus.NOT_FOUND));
    }
}
