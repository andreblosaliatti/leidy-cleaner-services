package br.com.leidycleaner.enderecos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record EnderecoDto(
        Long id,
        Long usuarioId,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        BigDecimal latitude,
        BigDecimal longitude,
        boolean principal,
        OffsetDateTime criadoEm
) {
}
