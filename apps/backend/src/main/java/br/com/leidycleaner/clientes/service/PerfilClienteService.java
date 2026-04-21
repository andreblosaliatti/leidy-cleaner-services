package br.com.leidycleaner.clientes.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.clientes.dto.PerfilClienteResumoDto;
import br.com.leidycleaner.clientes.mapper.PerfilClienteMapper;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;

@Service
public class PerfilClienteService {

    private final PerfilClienteRepository perfilClienteRepository;

    public PerfilClienteService(PerfilClienteRepository perfilClienteRepository) {
        this.perfilClienteRepository = perfilClienteRepository;
    }

    @Transactional(readOnly = true)
    public Optional<PerfilClienteResumoDto> buscarPorUsuarioId(Long usuarioId) {
        return perfilClienteRepository.findByUsuarioId(usuarioId)
                .map(PerfilClienteMapper::paraResumo);
    }
}
