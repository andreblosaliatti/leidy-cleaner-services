package br.com.leidycleaner.enderecos.mapper;

import br.com.leidycleaner.enderecos.dto.EnderecoDto;
import br.com.leidycleaner.enderecos.entity.Endereco;

public final class EnderecoMapper {

    private EnderecoMapper() {
    }

    public static EnderecoDto paraDto(Endereco endereco) {
        return new EnderecoDto(
                endereco.getId(),
                endereco.getUsuario().getId(),
                endereco.getCep(),
                endereco.getLogradouro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado(),
                endereco.getLatitude(),
                endereco.getLongitude(),
                endereco.isPrincipal(),
                endereco.getCriadoEm()
        );
    }
}
