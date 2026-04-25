package br.com.leidycleaner.ocorrencias.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.ocorrencias.entity.OcorrenciaAtendimento;

public interface OcorrenciaAtendimentoRepository extends JpaRepository<OcorrenciaAtendimento, Long> {

    List<OcorrenciaAtendimento> findByAbertoPorIdOrderByCriadoEmDescIdDesc(Long abertoPorUsuarioId);

    List<OcorrenciaAtendimento> findAllByOrderByCriadoEmDescIdDesc();
}
