package br.com.leidycleaner.notificacoes.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.notificacoes.dto.DispositivoPushResponse;
import br.com.leidycleaner.notificacoes.dto.RegistrarDispositivoPushRequest;
import br.com.leidycleaner.notificacoes.dto.TestePushResponse;
import br.com.leidycleaner.notificacoes.service.DispositivoPushService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/notificacoes")
@PreAuthorize("hasRole('PROFISSIONAL')")
public class NotificacaoPushController {

    private final DispositivoPushService dispositivoPushService;

    public NotificacaoPushController(DispositivoPushService dispositivoPushService) {
        this.dispositivoPushService = dispositivoPushService;
    }

    @PostMapping("/dispositivos")
    public ApiResponse<DispositivoPushResponse> registrarDispositivo(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody RegistrarDispositivoPushRequest request
    ) {
        return ApiResponse.success(dispositivoPushService.registrar(principal.getId(), request));
    }

    @DeleteMapping("/dispositivos/{id}")
    public ApiResponse<DispositivoPushResponse> desativarDispositivo(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(dispositivoPushService.desativar(principal.getId(), id));
    }

    @PostMapping("/teste")
    public ApiResponse<TestePushResponse> enviarTeste(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(dispositivoPushService.enviarTeste(principal.getId()));
    }
}
