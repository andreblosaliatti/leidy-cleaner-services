package br.com.leidycleaner.solicitacoes.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.solicitacoes.dto.ProfissionalDisponivelDto;
import br.com.leidycleaner.solicitacoes.dto.SelecaoProfissionaisDto;
import br.com.leidycleaner.solicitacoes.dto.SelecionarProfissionaisRequest;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaDto;
import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaRequest;
import br.com.leidycleaner.solicitacoes.service.SolicitacaoFaxinaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/solicitacoes")
public class SolicitacaoFaxinaController {

    private final SolicitacaoFaxinaService solicitacaoFaxinaService;

    public SolicitacaoFaxinaController(SolicitacaoFaxinaService solicitacaoFaxinaService) {
        this.solicitacaoFaxinaService = solicitacaoFaxinaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SolicitacaoFaxinaDto> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody SolicitacaoFaxinaRequest request
    ) {
        return ApiResponse.success(solicitacaoFaxinaService.criar(principal.getId(), request));
    }

    @GetMapping("/minhas")
    public ApiResponse<List<SolicitacaoFaxinaDto>> listarMinhas(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(solicitacaoFaxinaService.listarMinhas(principal.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<SolicitacaoFaxinaDto> buscar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(solicitacaoFaxinaService.buscarMinha(principal.getId(), id));
    }

    @GetMapping("/{id}/profissionais-disponiveis")
    public ApiResponse<List<ProfissionalDisponivelDto>> listarProfissionaisDisponiveis(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(solicitacaoFaxinaService.listarProfissionaisDisponiveis(principal.getId(), id));
    }

    @PostMapping("/{id}/selecionados")
    public ApiResponse<SelecaoProfissionaisDto> selecionarProfissionais(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SelecionarProfissionaisRequest request
    ) {
        return ApiResponse.success(solicitacaoFaxinaService.selecionarProfissionais(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/cancelar")
    public ApiResponse<SolicitacaoFaxinaDto> cancelar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(solicitacaoFaxinaService.cancelar(principal.getId(), id));
    }
}
