package br.com.leidycleaner.solicitacoes.service;

import java.time.DayOfWeek;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.enderecos.entity.Endereco;
import br.com.leidycleaner.enderecos.repository.EnderecoRepository;
import br.com.leidycleaner.profissionais.entity.DiaSemana;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;
import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;
import br.com.leidycleaner.solicitacoes.dto.ProfissionalDisponivelDto;
import br.com.leidycleaner.solicitacoes.dto.SelecaoProfissionaisDto;
import br.com.leidycleaner.solicitacoes.dto.SelecionarProfissionaisRequest;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaDto;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaRequest;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;
import br.com.leidycleaner.solicitacoes.mapper.SolicitacaoFaxinaMapper;
import br.com.leidycleaner.solicitacoes.mapper.SolicitacaoProfissionalSelecionadoMapper;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoFaxinaRepository;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoProfissionalSelecionadoRepository;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.verificacao.entity.StatusVerificacao;

@Service
public class SolicitacaoFaxinaService {

    private static final ZoneId FUSO_ATENDIMENTO = ZoneId.of("America/Sao_Paulo");

    private final SolicitacaoFaxinaRepository solicitacaoFaxinaRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository;

    public SolicitacaoFaxinaService(
            SolicitacaoFaxinaRepository solicitacaoFaxinaRepository,
            PerfilClienteRepository perfilClienteRepository,
            EnderecoRepository enderecoRepository,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository,
            PerfilProfissionalRepository perfilProfissionalRepository,
            SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository
    ) {
        this.solicitacaoFaxinaRepository = solicitacaoFaxinaRepository;
        this.perfilClienteRepository = perfilClienteRepository;
        this.enderecoRepository = enderecoRepository;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.solicitacaoProfissionalSelecionadoRepository = solicitacaoProfissionalSelecionadoRepository;
    }

    @Transactional
    public SolicitacaoFaxinaDto criar(Long usuarioId, SolicitacaoFaxinaRequest request) {
        PerfilCliente cliente = buscarPerfilCliente(usuarioId);
        Endereco endereco = enderecoRepository.findByIdAndUsuarioId(request.enderecoId(), usuarioId)
                .orElseThrow(() -> new BusinessException("ENDERECO_NOT_FOUND", "Endereco nao encontrado", HttpStatus.NOT_FOUND));
        RegiaoAtendimento regiao = regiaoAtendimentoRepository.findByIdAndAtivoTrue(request.regiaoId())
                .orElseThrow(() -> new BusinessException("REGIAO_NOT_FOUND", "Regiao de atendimento nao encontrada", HttpStatus.NOT_FOUND));

        SolicitacaoFaxina solicitacao = new SolicitacaoFaxina(
                cliente,
                endereco,
                regiao,
                request.dataHoraDesejada(),
                request.duracaoEstimadaHoras(),
                request.tipoServico(),
                request.observacoes(),
                request.valorServico(),
                request.percentualComissaoAgencia(),
                request.valorEstimadoProfissional()
        );

        return SolicitacaoFaxinaMapper.paraDto(solicitacaoFaxinaRepository.save(solicitacao));
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoFaxinaDto> listarMinhas(Long usuarioId) {
        buscarPerfilCliente(usuarioId);
        return solicitacaoFaxinaRepository.findByClienteUsuarioIdOrderByCriadoEmDescIdDesc(usuarioId)
                .stream()
                .map(SolicitacaoFaxinaMapper::paraDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitacaoFaxinaDto buscarMinha(Long usuarioId, Long solicitacaoId) {
        buscarPerfilCliente(usuarioId);
        return SolicitacaoFaxinaMapper.paraDto(buscarSolicitacaoDoCliente(usuarioId, solicitacaoId));
    }

    @Transactional
    public SolicitacaoFaxinaDto cancelar(Long usuarioId, Long solicitacaoId) {
        buscarPerfilCliente(usuarioId);
        SolicitacaoFaxina solicitacao = buscarSolicitacaoDoCliente(usuarioId, solicitacaoId);
        if (!solicitacao.podeCancelar()) {
            throw new BusinessException(
                    "SOLICITACAO_CANCELAMENTO_NAO_PERMITIDO",
                    "Solicitacao nao pode ser cancelada neste status",
                    HttpStatus.CONFLICT
            );
        }
        solicitacao.cancelar();
        return SolicitacaoFaxinaMapper.paraDto(solicitacao);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalDisponivelDto> listarProfissionaisDisponiveis(Long usuarioId, Long solicitacaoId) {
        buscarPerfilCliente(usuarioId);
        SolicitacaoFaxina solicitacao = buscarSolicitacaoDoCliente(usuarioId, solicitacaoId);
        validarStatusParaElegibilidade(solicitacao);

        return buscarProfissionaisElegiveis(solicitacao)
                .stream()
                .map(this::paraProfissionalDisponivel)
                .toList();
    }

    @Transactional
    public SelecaoProfissionaisDto selecionarProfissionais(Long usuarioId, Long solicitacaoId, SelecionarProfissionaisRequest request) {
        buscarPerfilCliente(usuarioId);
        SolicitacaoFaxina solicitacao = buscarSolicitacaoDoCliente(usuarioId, solicitacaoId);
        validarStatusParaElegibilidade(solicitacao);
        List<Long> profissionalIds = request.profissionalIds();
        validarQuantidadeEDuplicidade(profissionalIds);

        Map<Long, PerfilProfissional> profissionaisEncontrados = perfilProfissionalRepository.findByIdIn(profissionalIds)
                .stream()
                .collect(LinkedHashMap::new, (mapa, perfil) -> mapa.put(perfil.getId(), perfil), Map::putAll);
        List<Long> naoEncontrados = profissionalIds.stream()
                .filter(id -> !profissionaisEncontrados.containsKey(id))
                .toList();
        if (!naoEncontrados.isEmpty()) {
            throw new BusinessException("PROFISSIONAL_NOT_FOUND", "Profissional selecionado nao encontrado", HttpStatus.NOT_FOUND);
        }

        Set<Long> elegiveis = buscarProfissionaisElegiveis(solicitacao)
                .stream()
                .map(PerfilProfissional::getId)
                .collect(HashSet::new, Set::add, Set::addAll);
        List<Long> naoElegiveis = profissionalIds.stream()
                .filter(id -> !elegiveis.contains(id))
                .toList();
        if (!naoElegiveis.isEmpty()) {
            throw new BusinessException(
                    "PROFISSIONAL_NAO_ELEGIVEL",
                    "Profissional selecionado nao esta elegivel para esta solicitacao",
                    HttpStatus.CONFLICT
            );
        }

        solicitacaoProfissionalSelecionadoRepository.deleteBySolicitacaoId(solicitacao.getId());
        solicitacaoProfissionalSelecionadoRepository.flush();
        List<SolicitacaoProfissionalSelecionado> selecionados = salvarSelecaoOrdenada(solicitacao, profissionalIds, profissionaisEncontrados);

        return new SelecaoProfissionaisDto(
                solicitacao.getId(),
                selecionados.stream()
                        .map(SolicitacaoProfissionalSelecionadoMapper::paraDto)
                        .toList()
        );
    }

    private PerfilCliente buscarPerfilCliente(Long usuarioId) {
        return perfilClienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("Usuario autenticado nao possui perfil de cliente"));
    }

    private SolicitacaoFaxina buscarSolicitacaoDoCliente(Long usuarioId, Long solicitacaoId) {
        return solicitacaoFaxinaRepository.findByIdAndClienteUsuarioId(solicitacaoId, usuarioId)
                .orElseThrow(() -> new BusinessException("SOLICITACAO_NOT_FOUND", "Solicitacao nao encontrada", HttpStatus.NOT_FOUND));
    }

    private void validarStatusParaElegibilidade(SolicitacaoFaxina solicitacao) {
        if (solicitacao.getStatus() != StatusSolicitacao.CRIADA && solicitacao.getStatus() != StatusSolicitacao.AGUARDANDO_SELECAO) {
            throw new BusinessException(
                    "SOLICITACAO_STATUS_INCOMPATIVEL",
                    "Solicitacao nao permite listagem de profissionais neste status",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void validarQuantidadeEDuplicidade(List<Long> profissionalIds) {
        if (profissionalIds == null || profissionalIds.isEmpty()) {
            throw new BusinessException("SELECAO_VAZIA", "Selecione ao menos uma profissional", HttpStatus.BAD_REQUEST);
        }
        if (profissionalIds.size() > 3) {
            throw new BusinessException("SELECAO_LIMITE_EXCEDIDO", "Selecione no maximo 3 profissionais", HttpStatus.BAD_REQUEST);
        }
        Set<Long> unicos = new HashSet<>();
        boolean temDuplicado = profissionalIds.stream().anyMatch(id -> !unicos.add(id));
        if (temDuplicado) {
            throw new BusinessException("SELECAO_DUPLICADA", "Nao repita profissionais na mesma selecao", HttpStatus.BAD_REQUEST);
        }
    }

    private List<PerfilProfissional> buscarProfissionaisElegiveis(SolicitacaoFaxina solicitacao) {
        var dataHoraLocal = solicitacao.getDataHoraDesejada().atZoneSameInstant(FUSO_ATENDIMENTO);
        DiaSemana diaSemana = mapearDiaSemana(dataHoraLocal.getDayOfWeek());
        var horario = dataHoraLocal.toLocalTime();

        return perfilProfissionalRepository.findElegiveisParaSolicitacao(
                solicitacao.getRegiao().getId(),
                diaSemana,
                horario,
                StatusConta.ATIVA,
                StatusAprovacaoProfissional.APROVADO,
                StatusVerificacao.APROVADO
        );
    }

    private List<SolicitacaoProfissionalSelecionado> salvarSelecaoOrdenada(
            SolicitacaoFaxina solicitacao,
            List<Long> profissionalIds,
            Map<Long, PerfilProfissional> profissionaisEncontrados
    ) {
        List<SolicitacaoProfissionalSelecionado> selecionados = new ArrayList<>();
        for (int indice = 0; indice < profissionalIds.size(); indice++) {
            Long profissionalId = profissionalIds.get(indice);
            selecionados.add(new SolicitacaoProfissionalSelecionado(
                    solicitacao,
                    profissionaisEncontrados.get(profissionalId),
                    indice + 1
            ));
        }
        return solicitacaoProfissionalSelecionadoRepository.saveAll(selecionados);
    }

    private ProfissionalDisponivelDto paraProfissionalDisponivel(PerfilProfissional perfil) {
        return new ProfissionalDisponivelDto(
                perfil.getId(),
                perfil.getNomeExibicao(),
                perfil.getFotoPerfilUrl(),
                perfil.getExperienciaAnos(),
                perfil.getNotaMedia(),
                perfil.getTotalAvaliacoes()
        );
    }

    private DiaSemana mapearDiaSemana(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> DiaSemana.SEGUNDA;
            case TUESDAY -> DiaSemana.TERCA;
            case WEDNESDAY -> DiaSemana.QUARTA;
            case THURSDAY -> DiaSemana.QUINTA;
            case FRIDAY -> DiaSemana.SEXTA;
            case SATURDAY -> DiaSemana.SABADO;
            case SUNDAY -> DiaSemana.DOMINGO;
        };
    }
}
