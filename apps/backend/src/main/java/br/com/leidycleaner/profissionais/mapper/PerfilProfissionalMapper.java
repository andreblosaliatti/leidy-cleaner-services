package br.com.leidycleaner.profissionais.mapper;

import br.com.leidycleaner.profissionais.dto.AdminProfissionalResponse;
import br.com.leidycleaner.profissionais.dto.PerfilProfissionalResumoDto;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.usuarios.entity.Usuario;

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

    public static AdminProfissionalResponse paraAdminResponse(PerfilProfissional perfil) {
        Usuario usuario = perfil.getUsuario();
        return new AdminProfissionalResponse(
                perfil.getId(),
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTelefone(),
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
                perfil.getAtualizadoEm(),
                usuario.getStatusConta(),
                usuario.getTipoUsuario()
        );
    }
}
