package br.com.leidycleaner.profissionais.dto;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilProfissionalRequest(
        @Size(max = 160, message = "nomeExibicao deve ter no maximo 160 caracteres")
        String nomeExibicao,

        String descricao,

        @Size(max = 500, message = "fotoPerfilUrl deve ter no maximo 500 caracteres")
        String fotoPerfilUrl,

        @PositiveOrZero(message = "experienciaAnos deve ser maior ou igual a zero")
        Integer experienciaAnos,

        Boolean ativoParaReceberChamados
) {
}
