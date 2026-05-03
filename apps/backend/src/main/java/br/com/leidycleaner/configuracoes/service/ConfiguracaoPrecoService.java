package br.com.leidycleaner.configuracoes.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.configuracoes.dto.ConfiguracaoPrecoDto;
import br.com.leidycleaner.configuracoes.dto.ConfiguracaoPrecoUpdateRequest;
import br.com.leidycleaner.configuracoes.entity.ConfiguracaoPreco;
import br.com.leidycleaner.configuracoes.repository.ConfiguracaoPrecoRepository;
import br.com.leidycleaner.core.exception.BusinessException;

@Service
public class ConfiguracaoPrecoService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private final ConfiguracaoPrecoRepository configuracaoPrecoRepository;
    private final PricingProperties pricingProperties;

    public ConfiguracaoPrecoService(
            ConfiguracaoPrecoRepository configuracaoPrecoRepository,
            PricingProperties pricingProperties
    ) {
        this.configuracaoPrecoRepository = configuracaoPrecoRepository;
        this.pricingProperties = pricingProperties;
    }

    @Transactional(readOnly = true)
    public ConfiguracaoPrecoDto buscarAtiva() {
        return configuracaoPrecoRepository.findFirstByAtivoTrueOrderByAtualizadoEmDescIdDesc()
                .map(this::paraDto)
                .orElseGet(this::dtoFallback);
    }

    @Transactional
    public ConfiguracaoPrecoDto atualizarAtiva(ConfiguracaoPrecoUpdateRequest request) {
        validarValores(request.valorHora(), request.percentualComissaoAgencia());

        List<ConfiguracaoPreco> ativas = configuracaoPrecoRepository.findByAtivoTrueOrderByAtualizadoEmDescIdDesc();
        ConfiguracaoPreco configuracao = ativas.isEmpty()
                ? new ConfiguracaoPreco(normalizarMoeda(request.valorHora()), normalizarPercentual(request.percentualComissaoAgencia()))
                : ativas.get(0);

        configuracao.atualizarValores(
                normalizarMoeda(request.valorHora()),
                normalizarPercentual(request.percentualComissaoAgencia())
        );

        ativas.stream()
                .skip(1)
                .forEach(ConfiguracaoPreco::desativar);

        return paraDto(configuracaoPrecoRepository.save(configuracao));
    }

    @Transactional(readOnly = true)
    public ValoresCalculadosPreco calcularValores(int duracaoEstimadaHoras) {
        ConfiguracaoPrecoDto configuracao = buscarAtiva();
        BigDecimal valorServico = configuracao.valorHora()
                .multiply(BigDecimal.valueOf(duracaoEstimadaHoras))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal percentualComissaoAgencia = configuracao.percentualComissaoAgencia()
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal valorComissao = valorServico
                .multiply(percentualComissaoAgencia)
                .divide(CEM, 2, RoundingMode.HALF_UP);
        BigDecimal valorEstimadoProfissional = valorServico
                .subtract(valorComissao)
                .setScale(2, RoundingMode.HALF_UP);

        return new ValoresCalculadosPreco(valorServico, percentualComissaoAgencia, valorEstimadoProfissional);
    }

    private ConfiguracaoPrecoDto paraDto(ConfiguracaoPreco configuracao) {
        BigDecimal percentualComissao = normalizarPercentual(configuracao.getPercentualComissaoAgencia());
        return new ConfiguracaoPrecoDto(
                configuracao.getId(),
                normalizarMoeda(configuracao.getValorHora()),
                percentualComissao,
                CEM.subtract(percentualComissao).setScale(2, RoundingMode.HALF_UP),
                configuracao.isAtivo(),
                configuracao.getAtualizadoEm()
        );
    }

    private ConfiguracaoPrecoDto dtoFallback() {
        validarValores(pricingProperties.getHourlyRate(), pricingProperties.getAgencyCommissionPercent());
        BigDecimal percentualComissao = normalizarPercentual(pricingProperties.getAgencyCommissionPercent());
        return new ConfiguracaoPrecoDto(
                null,
                normalizarMoeda(pricingProperties.getHourlyRate()),
                percentualComissao,
                CEM.subtract(percentualComissao).setScale(2, RoundingMode.HALF_UP),
                true,
                OffsetDateTime.now()
        );
    }

    private void validarValores(BigDecimal valorHora, BigDecimal percentualComissaoAgencia) {
        if (valorHora == null || valorHora.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(
                    "CONFIGURACAO_PRECO_INVALIDA",
                    "Valor da hora deve ser maior que zero",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (percentualComissaoAgencia == null
                || percentualComissaoAgencia.compareTo(BigDecimal.ZERO) < 0
                || percentualComissaoAgencia.compareTo(CEM) > 0) {
            throw new BusinessException(
                    "CONFIGURACAO_PRECO_INVALIDA",
                    "Percentual de comissao da agencia deve estar entre 0 e 100",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private BigDecimal normalizarMoeda(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizarPercentual(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    public record ValoresCalculadosPreco(
            BigDecimal valorServico,
            BigDecimal percentualComissaoAgencia,
            BigDecimal valorEstimadoProfissional
    ) {
    }
}
