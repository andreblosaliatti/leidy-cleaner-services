package br.com.leidycleaner.pagamentos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.pagamentos.dto.CheckoutDto;
import br.com.leidycleaner.pagamentos.dto.CheckoutRequest;
import br.com.leidycleaner.pagamentos.dto.PagamentoDto;
import br.com.leidycleaner.pagamentos.dto.PagamentoRequest;
import br.com.leidycleaner.pagamentos.service.PagamentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Deprecated(forRemoval = false)
    public ApiResponse<PagamentoDto> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody PagamentoRequest request
    ) {
        return ApiResponse.success(pagamentoService.criar(principal.getId(), request));
    }

    @GetMapping("/atendimento/{atendimentoId}")
    public ApiResponse<PagamentoDto> buscarPorAtendimento(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long atendimentoId
    ) {
        return ApiResponse.success(pagamentoService.buscarPorAtendimento(principal.getId(), atendimentoId));
    }

    @GetMapping("/{id}")
    public ApiResponse<PagamentoDto> buscar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(pagamentoService.buscarPorId(principal.getId(), id));
    }

    @PostMapping("/{id}/consultar-status")
    public ApiResponse<PagamentoDto> consultarStatus(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(pagamentoService.consultarStatus(principal.getId(), id));
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CheckoutDto> criarCheckout(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody CheckoutRequest request
    ) {
        return ApiResponse.success(pagamentoService.criarCheckout(principal.getId(), request));
    }
}
