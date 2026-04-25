package br.com.leidycleaner.ocorrencias.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
import br.com.leidycleaner.ocorrencias.dto.AtualizarStatusOcorrenciaRequest;
import br.com.leidycleaner.ocorrencias.dto.OcorrenciaAtendimentoDto;
import br.com.leidycleaner.ocorrencias.dto.OcorrenciaAtendimentoRequest;
import br.com.leidycleaner.ocorrencias.service.OcorrenciaAtendimentoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/ocorrencias")
public class OcorrenciaAtendimentoController {

    private final OcorrenciaAtendimentoService ocorrenciaAtendimentoService;

    public OcorrenciaAtendimentoController(OcorrenciaAtendimentoService ocorrenciaAtendimentoService) {
        this.ocorrenciaAtendimentoService = ocorrenciaAtendimentoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OcorrenciaAtendimentoDto> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody OcorrenciaAtendimentoRequest request
    ) {
        return ApiResponse.success(ocorrenciaAtendimentoService.criar(principal.getId(), request));
    }

    @GetMapping("/meus")
    public ApiResponse<List<OcorrenciaAtendimentoDto>> listarMinhas(
            @AuthenticationPrincipal UsuarioPrincipal principal
    ) {
        return ApiResponse.success(ocorrenciaAtendimentoService.listarMinhas(principal.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<OcorrenciaAtendimentoDto> buscar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(ocorrenciaAtendimentoService.buscarVisivel(principal.getId(), id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<OcorrenciaAtendimentoDto>> listarTodas() {
        return ApiResponse.success(ocorrenciaAtendimentoService.listarTodas());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OcorrenciaAtendimentoDto> alterarStatus(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AtualizarStatusOcorrenciaRequest request
    ) {
        return ApiResponse.success(ocorrenciaAtendimentoService.alterarStatus(principal.getId(), id, request));
    }
}
