package br.com.leidycleaner.notificacoes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.notificacoes.entity.DispositivoPush;
import br.com.leidycleaner.notificacoes.entity.PlataformaPush;

public interface DispositivoPushRepository extends JpaRepository<DispositivoPush, Long> {

    Optional<DispositivoPush> findByUsuario_IdAndPlataformaAndToken(
            Long usuarioId,
            PlataformaPush plataforma,
            String token
    );

    List<DispositivoPush> findByUsuario_IdAndAtivoTrue(Long usuarioId);

    long countByUsuario_IdAndPlataformaAndToken(Long usuarioId, PlataformaPush plataforma, String token);
}
