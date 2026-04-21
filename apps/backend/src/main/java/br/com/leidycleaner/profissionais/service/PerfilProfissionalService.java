package br.com.leidycleaner.profissionais.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.profissionais.dto.AnalisarProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.AtualizarPerfilProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.PerfilProfissionalResumoDto;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.mapper.PerfilProfissionalMapper;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;

@Service
public class PerfilProfissionalService {

    private final PerfilProfissionalRepository perfilProfissionalRepository;

    public PerfilProfissionalService(PerfilProfissionalRepository perfilProfissionalRepository) {
        this.perfilProfissionalRepository = perfilProfissionalRepository;
    }

    @Transactional(readOnly = true)
    public Optional<PerfilProfissionalResumoDto> buscarPorUsuarioId(Long usuarioId) {
        return perfilProfissionalRepository.findByUsuarioId(usuarioId)
                .map(PerfilProfissionalMapper::paraResumo);
    }

    @Transactional(readOnly = true)
    public boolean cpfJaCadastrado(String cpf) {
        return perfilProfissionalRepository.existsByCpf(cpf);
    }

    @Transactional(readOnly = true)
    public PerfilProfissional buscarPerfilDaProfissional(Long usuarioId) {
        return perfilProfissionalRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("Perfil profissional nao encontrado para usuario autenticado"));
    }

    @Transactional(readOnly = true)
    public PerfilProfissionalResumoDto buscarMeuPerfil(Long usuarioId) {
        return PerfilProfissionalMapper.paraResumo(buscarPerfilDaProfissional(usuarioId));
    }

    @Transactional
    public PerfilProfissionalResumoDto atualizarMeuPerfil(Long usuarioId, AtualizarPerfilProfissionalRequest request) {
        PerfilProfissional perfil = buscarPerfilDaProfissional(usuarioId);

        perfil.atualizarPerfil(
                request.nomeExibicao(),
                request.descricao(),
                request.fotoPerfilUrl(),
                request.experienciaAnos(),
                request.ativoParaReceberChamados()
        );

        perfilProfissionalRepository.flush();
        return PerfilProfissionalMapper.paraResumo(perfil);
    }

    @Transactional
    public PerfilProfissionalResumoDto analisarProfissional(Long profissionalId, AnalisarProfissionalRequest request) {
        PerfilProfissional perfil = perfilProfissionalRepository.findById(profissionalId)
                .orElseThrow(() -> new BusinessException(
                        "PROFISSIONAL_NOT_FOUND",
                        "Profissional nao encontrado",
                        HttpStatus.NOT_FOUND
                ));

        perfil.alterarStatusAprovacao(request.statusAprovacao());

        perfilProfissionalRepository.flush();
        return PerfilProfissionalMapper.paraResumo(perfil);
    }
}