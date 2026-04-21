package br.com.leidycleaner.convites.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.convites.entity.ConviteProfissional;

public interface ConviteProfissionalRepository extends JpaRepository<ConviteProfissional, Long> {

    List<ConviteProfissional> findByProfissionalUsuarioIdOrderByEnviadoEmDescIdDesc(Long usuarioId);

    Optional<ConviteProfissional> findByIdAndProfissionalUsuarioId(Long id, Long usuarioId);

    void deleteBySolicitacaoId(Long solicitacaoId);
}
