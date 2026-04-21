package br.com.leidycleaner.profissionais.repository;

import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.profissionais.entity.DiaSemana;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.verificacao.entity.StatusVerificacao;

public interface PerfilProfissionalRepository extends JpaRepository<PerfilProfissional, Long> {

    Optional<PerfilProfissional> findByUsuarioId(Long usuarioId);

    Optional<PerfilProfissional> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<PerfilProfissional> findByIdIn(Collection<Long> ids);

    // Effective/current verification means no newer document exists by analisadoEm,
    // otherwise criadoEm, with id desc as deterministic tie-breaker.
    @Query("""
            select perfil
            from PerfilProfissional perfil
            join perfil.usuario usuario
            where usuario.statusConta = :statusConta
              and perfil.statusAprovacao = :statusAprovacao
              and perfil.ativoParaReceberChamados = true
              and exists (
                  select profissionalRegiao.id
                  from ProfissionalRegiao profissionalRegiao
                  where profissionalRegiao.profissional = perfil
                    and profissionalRegiao.regiao.id = :regiaoId
              )
              and exists (
                  select disponibilidade.id
                  from DisponibilidadeProfissional disponibilidade
                  where disponibilidade.profissional = perfil
                    and disponibilidade.diaSemana = :diaSemana
                    and disponibilidade.ativo = true
                    and disponibilidade.horaInicio <= :horario
                    and disponibilidade.horaFim >= :horario
              )
              and exists (
                  select documento.id
                  from DocumentoVerificacao documento
                  where documento.usuario = usuario
                    and documento.statusVerificacao = :statusVerificacao
                    and not exists (
                        select documentoMaisRecente.id
                        from DocumentoVerificacao documentoMaisRecente
                        where documentoMaisRecente.usuario = usuario
                          and (
                              coalesce(documentoMaisRecente.analisadoEm, documentoMaisRecente.criadoEm) > coalesce(documento.analisadoEm, documento.criadoEm)
                              or (
                                  coalesce(documentoMaisRecente.analisadoEm, documentoMaisRecente.criadoEm) = coalesce(documento.analisadoEm, documento.criadoEm)
                                  and documentoMaisRecente.id > documento.id
                              )
                          )
                    )
              )
            order by perfil.nomeExibicao asc, perfil.id asc
            """)
    List<PerfilProfissional> findElegiveisParaSolicitacao(
            @Param("regiaoId") Long regiaoId,
            @Param("diaSemana") DiaSemana diaSemana,
            @Param("horario") LocalTime horario,
            @Param("statusConta") StatusConta statusConta,
            @Param("statusAprovacao") StatusAprovacaoProfissional statusAprovacao,
            @Param("statusVerificacao") StatusVerificacao statusVerificacao
    );
}
