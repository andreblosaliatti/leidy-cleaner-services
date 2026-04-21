package br.com.leidycleaner.enderecos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.enderecos.entity.Endereco;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    List<Endereco> findByUsuarioIdOrderByPrincipalDescCriadoEmAscIdAsc(Long usuarioId);

    Optional<Endereco> findByIdAndUsuarioId(Long id, Long usuarioId);

    Optional<Endereco> findFirstByUsuarioIdOrderByCriadoEmAscIdAsc(Long usuarioId);

    Optional<Endereco> findFirstByUsuarioIdAndIdNotOrderByCriadoEmAscIdAsc(Long usuarioId, Long id);

    long countByUsuarioId(Long usuarioId);

    @Modifying
    @Query("""
            update Endereco endereco
            set endereco.principal = false
            where endereco.usuario.id = :usuarioId
            """)
    void desmarcarPrincipaisDoUsuario(@Param("usuarioId") Long usuarioId);
}
