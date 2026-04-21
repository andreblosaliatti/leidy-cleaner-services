package br.com.leidycleaner.profissionais.mapper;

import br.com.leidycleaner.profissionais.dto.PerfilProfissionalResumoDto;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;

public final class PerfilProfissionalMapper {

    private PerfilProfissionalMapper() {
    }

    public static PerfilProfissionalResumoDto paraResumo(PerfilProfissional perfil) {
        return new PerfilProfissionalResumoDto(
                perfil.getId(),
                perfil.getUsuario().getId(),
                perfil.getNomeExibicao(),
                perfil.getCpf(),
                perfil.getDataNascimento(),
                perfil.getDescricao(),
                perfil.getFotoPerfilUrl(),
                perfil.getExperienciaAnos(),
                perfil.isAtivoParaReceberChamados(),
                perfil.getStatusAprovacao(),
                perfil.getNotaMedia(),
                perfil.getTotalAvaliacoes(),
                perfil.getCriadoEm(),
                perfil.getAtualizadoEm()
        );
    }
}
