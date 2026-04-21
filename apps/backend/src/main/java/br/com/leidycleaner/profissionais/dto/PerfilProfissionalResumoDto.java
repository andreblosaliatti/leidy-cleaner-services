package br.com.leidycleaner.profissionais.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;

public record PerfilProfissionalResumoDto(
        Long id,
        Long usuarioId,
        String nomeExibicao,
        String cpf,
        LocalDate dataNascimento,
        String descricao,
        String fotoPerfilUrl,
        int experienciaAnos,
        boolean ativoParaReceberChamados,
        StatusAprovacaoProfissional statusAprovacao,
        BigDecimal notaMedia,
        int totalAvaliacoes,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
