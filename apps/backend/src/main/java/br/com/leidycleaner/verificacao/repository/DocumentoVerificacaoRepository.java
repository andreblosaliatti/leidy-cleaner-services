package br.com.leidycleaner.verificacao.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.verificacao.entity.DocumentoVerificacao;

public interface DocumentoVerificacaoRepository extends JpaRepository<DocumentoVerificacao, Long> {

    Optional<DocumentoVerificacao> findFirstByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);

    List<DocumentoVerificacao> findByOrderByCriadoEmDesc();
}
