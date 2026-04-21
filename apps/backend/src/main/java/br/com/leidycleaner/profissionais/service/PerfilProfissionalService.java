package br.com.leidycleaner.profissionais.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.profissionais.dto.PerfilProfissionalResumoDto;
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
}
