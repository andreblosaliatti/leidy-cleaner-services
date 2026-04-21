package br.com.leidycleaner.clientes.mapper;

import br.com.leidycleaner.clientes.dto.PerfilClienteResumoDto;
import br.com.leidycleaner.clientes.entity.PerfilCliente;

public final class PerfilClienteMapper {

    private PerfilClienteMapper() {
    }

    public static PerfilClienteResumoDto paraResumo(PerfilCliente perfil) {
        return new PerfilClienteResumoDto(
                perfil.getId(),
                perfil.getUsuario().getId(),
                perfil.getObservacoesInternas(),
                perfil.getCriadoEm(),
                perfil.getAtualizadoEm()
        );
    }
}
