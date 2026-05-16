package br.com.leidycleaner.notificacoes.service;

import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.notificacoes.dto.DispositivoPushResponse;
import br.com.leidycleaner.notificacoes.dto.RegistrarDispositivoPushRequest;
import br.com.leidycleaner.notificacoes.dto.TestePushResponse;
import br.com.leidycleaner.notificacoes.entity.DispositivoPush;
import br.com.leidycleaner.notificacoes.repository.DispositivoPushRepository;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class DispositivoPushService {

    private static final Logger log = LoggerFactory.getLogger(DispositivoPushService.class);

    private final DispositivoPushRepository dispositivoPushRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoPushService notificacaoPushService;

    public DispositivoPushService(
            DispositivoPushRepository dispositivoPushRepository,
            UsuarioRepository usuarioRepository,
            NotificacaoPushService notificacaoPushService
    ) {
        this.dispositivoPushRepository = dispositivoPushRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoPushService = notificacaoPushService;
    }

    @Transactional
    public DispositivoPushResponse registrar(Long usuarioId, RegistrarDispositivoPushRequest request) {
        Usuario usuario = buscarUsuarioProfissional(usuarioId);
        String token = normalizarToken(request.token());
        OffsetDateTime agora = OffsetDateTime.now();

        DispositivoPush dispositivo = dispositivoPushRepository
                .findByUsuario_IdAndPlataformaAndToken(usuarioId, request.plataforma(), token)
                .map(existing -> {
                    existing.reativar(agora);
                    return existing;
                })
                .orElseGet(() -> new DispositivoPush(usuario, request.plataforma(), token, agora));

        DispositivoPush salvo = dispositivoPushRepository.save(dispositivo);
        log.debug("Dispositivo push registrado para usuarioId={} plataforma={} token={}",
                usuarioId,
                request.plataforma(),
                mascararToken(token));
        return toResponse(salvo);
    }

    @Transactional
    public DispositivoPushResponse desativar(Long usuarioId, Long dispositivoId) {
        DispositivoPush dispositivo = dispositivoPushRepository.findById(dispositivoId)
                .orElseThrow(() -> new BusinessException(
                        "DISPOSITIVO_PUSH_NOT_FOUND",
                        "Dispositivo de notificacao nao encontrado",
                        HttpStatus.NOT_FOUND
                ));

        if (!dispositivo.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException(
                    "DISPOSITIVO_PUSH_FORBIDDEN",
                    "Voce nao pode desativar este dispositivo",
                    HttpStatus.FORBIDDEN
            );
        }

        dispositivo.desativar();
        return toResponse(dispositivoPushRepository.save(dispositivo));
    }

    public TestePushResponse enviarTeste(Long usuarioId) {
        buscarUsuarioProfissional(usuarioId);
        var dispositivos = dispositivoPushRepository.findByUsuario_IdAndAtivoTrue(usuarioId);
        return notificacaoPushService.enviarTeste(usuarioId, dispositivos);
    }

    private Usuario buscarUsuarioProfissional(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException(
                        "USUARIO_NOT_FOUND",
                        "Usuario nao encontrado",
                        HttpStatus.NOT_FOUND
                ));

        if (usuario.getTipoUsuario() != TipoUsuario.PROFISSIONAL) {
            throw new BusinessException(
                    "USUARIO_NAO_PROFISSIONAL",
                    "Apenas profissionais podem registrar notificacoes",
                    HttpStatus.FORBIDDEN
            );
        }

        return usuario;
    }

    private String normalizarToken(String token) {
        String tokenNormalizado = token == null ? "" : token.trim();
        if (tokenNormalizado.isBlank()) {
            throw new BusinessException(
                    "PUSH_TOKEN_INVALIDO",
                    "Token de notificacao invalido",
                    HttpStatus.BAD_REQUEST
            );
        }
        return tokenNormalizado;
    }

    private DispositivoPushResponse toResponse(DispositivoPush dispositivo) {
        return new DispositivoPushResponse(
                dispositivo.getId(),
                dispositivo.getUsuario().getId(),
                dispositivo.getPlataforma(),
                mascararToken(dispositivo.getToken()),
                dispositivo.isAtivo(),
                dispositivo.getUltimoUsoEm(),
                dispositivo.getCriadoEm(),
                dispositivo.getAtualizadoEm()
        );
    }

    private String mascararToken(String token) {
        if (token == null || token.isBlank()) {
            return "";
        }

        if (token.length() <= 12) {
            return token.charAt(0) + "***" + token.charAt(token.length() - 1);
        }

        return token.substring(0, 6) + "..." + token.substring(token.length() - 4);
    }
}
