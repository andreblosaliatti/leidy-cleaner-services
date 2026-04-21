package br.com.leidycleaner.profissionais.dto;

import java.util.Set;

import jakarta.validation.constraints.NotEmpty;

public record DefinirRegioesProfissionalRequest(
        @NotEmpty(message = "regiaoIds deve conter ao menos uma regiao")
        Set<Long> regiaoIds
) {
}
