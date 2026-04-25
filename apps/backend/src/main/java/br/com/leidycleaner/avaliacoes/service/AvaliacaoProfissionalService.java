package br.com.leidycleaner.avaliacoes.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.avaliacoes.dto.AvaliacaoProfissionalDto;
import br.com.leidycleaner.avaliacoes.dto.AvaliacaoProfissionalRequest;
import br.com.leidycleaner.avaliacoes.entity.AvaliacaoProfissional;
import br.com.leidycleaner.avaliacoes.mapper.AvaliacaoProfissionalMapper;
import br.com.leidycleaner.avaliacoes.repository.AvaliacaoProfissionalRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;

@Service
public class AvaliacaoProfissionalService {

    private final AvaliacaoProfissionalRepository avaliacaoProfissionalRepository;
    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;

    public AvaliacaoProfissionalService(
            AvaliacaoProfissionalRepository avaliacaoProfissionalRepository,
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            PerfilProfissionalRepository perfilProfissionalRepository
    ) {
        this.avaliacaoProfissionalRepository = avaliacaoProfissionalRepository;
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
    }

    @Transactional
    public AvaliacaoProfissionalDto criar(Long usuarioId, AvaliacaoProfissionalRequest request) {
        AtendimentoFaxina atendimento = buscarAtendimentoAvaliado(usuarioId, request.atendimentoId());
        validarAtendimentoFinalizado(atendimento);
        validarAindaNaoAvaliado(atendimento);

        PerfilProfissional profissional = atendimento.getProfissional();
        if (profissional == null) {
            throw new BusinessException(
                    "ATENDIMENTO_PROFISSIONAL_INVALIDO",
                    "Atendimento nao possui profissional valida para avaliacao",
                    HttpStatus.CONFLICT
            );
        }

        AvaliacaoProfissional avaliacao = avaliacaoProfissionalRepository.saveAndFlush(new AvaliacaoProfissional(
                atendimento,
                atendimento.getCliente(),
                profissional,
                request.nota(),
                request.comentario()
        ));
        recalcularAgregadosProfissional(profissional);

        return AvaliacaoProfissionalMapper.paraDto(avaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoProfissionalDto> listarPorProfissional(Long profissionalId) {
        if (!perfilProfissionalRepository.existsById(profissionalId)) {
            throw new BusinessException(
                    "PROFISSIONAL_NOT_FOUND",
                    "Profissional nao encontrado",
                    HttpStatus.NOT_FOUND
            );
        }
        return avaliacaoProfissionalRepository.findByProfissionalIdOrderByCriadoEmDescIdDesc(profissionalId)
                .stream()
                .map(AvaliacaoProfissionalMapper::paraDto)
                .toList();
    }

    private AtendimentoFaxina buscarAtendimentoAvaliado(Long usuarioId, Long atendimentoId) {
        AtendimentoFaxina atendimento = atendimentoFaxinaRepository.findById(atendimentoId)
                .orElseThrow(() -> new BusinessException(
                        "ATENDIMENTO_NOT_FOUND",
                        "Atendimento nao encontrado",
                        HttpStatus.NOT_FOUND
                ));
        if (!atendimento.getCliente().getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException(
                    "ATENDIMENTO_NOT_FOUND",
                    "Atendimento nao encontrado",
                    HttpStatus.NOT_FOUND
            );
        }
        return atendimento;
    }

    private void validarAtendimentoFinalizado(AtendimentoFaxina atendimento) {
        if (atendimento.getStatus() != StatusAtendimento.FINALIZADO) {
            throw new BusinessException(
                    "ATENDIMENTO_NAO_FINALIZADO",
                    "Avaliacao permitida somente apos finalizacao do atendimento",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void validarAindaNaoAvaliado(AtendimentoFaxina atendimento) {
        if (avaliacaoProfissionalRepository.existsByAtendimentoId(atendimento.getId())) {
            throw new BusinessException(
                    "AVALIACAO_JA_EXISTE",
                    "Atendimento ja possui avaliacao",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void recalcularAgregadosProfissional(PerfilProfissional profissional) {
        long totalAvaliacoes = avaliacaoProfissionalRepository.countByProfissionalId(profissional.getId());
        Double notaMedia = avaliacaoProfissionalRepository.calcularNotaMediaProfissional(profissional.getId());
        profissional.atualizarAgregadoAvaliacoes(
                notaMedia == null ? BigDecimal.ZERO : BigDecimal.valueOf(notaMedia),
                Math.toIntExact(totalAvaliacoes)
        );
        perfilProfissionalRepository.flush();
    }
}
