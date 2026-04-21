package br.com.leidycleaner.regioes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.regioes.dto.RegiaoAtendimentoDto;
import br.com.leidycleaner.regioes.mapper.RegiaoAtendimentoMapper;
import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;

@Service
public class RegiaoAtendimentoService {

    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;

    public RegiaoAtendimentoService(RegiaoAtendimentoRepository regiaoAtendimentoRepository) {
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
    }

    @Transactional(readOnly = true)
    public List<RegiaoAtendimentoDto> listarAtivas() {
        return regiaoAtendimentoRepository.findByAtivoTrueOrderByNomeAsc()
                .stream()
                .map(RegiaoAtendimentoMapper::paraDto)
                .toList();
    }
}
