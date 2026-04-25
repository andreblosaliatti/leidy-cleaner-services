package br.com.leidycleaner.atendimentos.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.atendimentos.dto.AtendimentoFaxinaDto;
import br.com.leidycleaner.atendimentos.dto.CheckpointServicoDto;
import br.com.leidycleaner.atendimentos.dto.CheckpointServicoRequest;
import br.com.leidycleaner.atendimentos.service.AtendimentoFaxinaService;
import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/atendimentos")
public class AtendimentoFaxinaController {

    private final AtendimentoFaxinaService atendimentoFaxinaService;

    public AtendimentoFaxinaController(AtendimentoFaxinaService atendimentoFaxinaService) {
        this.atendimentoFaxinaService = atendimentoFaxinaService;
    }

    @GetMapping("/meus")
    public ApiResponse<List<AtendimentoFaxinaDto>> listarMeus(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(atendimentoFaxinaService.listarMeus(principal.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<AtendimentoFaxinaDto> buscar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(atendimentoFaxinaService.buscarRelacionado(principal.getId(), id));
    }

    @GetMapping("/{id}/checkpoints")
    public ApiResponse<List<CheckpointServicoDto>> listarCheckpoints(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(atendimentoFaxinaService.listarCheckpoints(principal.getId(), id));
    }

    @PostMapping("/{id}/iniciar")
    public ApiResponse<AtendimentoFaxinaDto> iniciar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CheckpointServicoRequest request
    ) {
        return ApiResponse.success(atendimentoFaxinaService.iniciar(principal.getId(), id, request));
    }

    @PostMapping("/{id}/finalizar")
    public ApiResponse<AtendimentoFaxinaDto> finalizar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CheckpointServicoRequest request
    ) {
        return ApiResponse.success(atendimentoFaxinaService.finalizar(principal.getId(), id, request));
    }
}
