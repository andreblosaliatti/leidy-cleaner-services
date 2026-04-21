package br.com.leidycleaner.solicitacoes.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.enderecos.entity.Endereco;
import br.com.leidycleaner.enderecos.repository.EnderecoRepository;
import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;
import br.com.leidycleaner.regioes.repository.RegiaoAtendimentoRepository;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaDto;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaRequest;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.mapper.SolicitacaoFaxinaMapper;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoFaxinaRepository;

@Service
public class SolicitacaoFaxinaService {

    private final SolicitacaoFaxinaRepository solicitacaoFaxinaRepository;
    private final PerfilClienteRepository perfilClienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final RegiaoAtendimentoRepository regiaoAtendimentoRepository;

    public SolicitacaoFaxinaService(
            SolicitacaoFaxinaRepository solicitacaoFaxinaRepository,
            PerfilClienteRepository perfilClienteRepository,
            EnderecoRepository enderecoRepository,
            RegiaoAtendimentoRepository regiaoAtendimentoRepository
    ) {
        this.solicitacaoFaxinaRepository = solicitacaoFaxinaRepository;
        this.perfilClienteRepository = perfilClienteRepository;
        this.enderecoRepository = enderecoRepository;
        this.regiaoAtendimentoRepository = regiaoAtendimentoRepository;
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

    private PerfilCliente buscarPerfilCliente(Long usuarioId) {
        return perfilClienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new AccessDeniedException("Usuario autenticado nao possui perfil de cliente"));
    }

    private SolicitacaoFaxina buscarSolicitacaoDoCliente(Long usuarioId, Long solicitacaoId) {
        return solicitacaoFaxinaRepository.findByIdAndClienteUsuarioId(solicitacaoId, usuarioId)
                .orElseThrow(() -> new BusinessException("SOLICITACAO_NOT_FOUND", "Solicitacao nao encontrada", HttpStatus.NOT_FOUND));
    }
}
