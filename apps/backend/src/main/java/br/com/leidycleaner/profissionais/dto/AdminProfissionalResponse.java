package br.com.leidycleaner.profissionais.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;

public record AdminProfissionalResponse(
        Long id,
        Long usuarioId,
        String nomeCompleto,
        String email,
        String telefone,
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
        OffsetDateTime atualizadoEm,
        StatusConta statusConta,
        TipoUsuario tipoUsuario
) {
}
