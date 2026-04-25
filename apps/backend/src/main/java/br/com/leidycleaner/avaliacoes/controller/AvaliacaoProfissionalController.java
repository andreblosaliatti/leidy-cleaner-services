package br.com.leidycleaner.avaliacoes.controller;

import java.util.List;

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
import br.com.leidycleaner.avaliacoes.dto.AvaliacaoProfissionalDto;
import br.com.leidycleaner.avaliacoes.dto.AvaliacaoProfissionalRequest;
import br.com.leidycleaner.avaliacoes.service.AvaliacaoProfissionalService;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1)
public class AvaliacaoProfissionalController {

    private final AvaliacaoProfissionalService avaliacaoProfissionalService;

    public AvaliacaoProfissionalController(AvaliacaoProfissionalService avaliacaoProfissionalService) {
        this.avaliacaoProfissionalService = avaliacaoProfissionalService;
    }

    @PostMapping("/avaliacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AvaliacaoProfissionalDto> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody AvaliacaoProfissionalRequest request
    ) {
        return ApiResponse.success(avaliacaoProfissionalService.criar(principal.getId(), request));
    }

    @GetMapping("/profissionais/{id}/avaliacoes")
    public ApiResponse<List<AvaliacaoProfissionalDto>> listarPorProfissional(@PathVariable Long id) {
        return ApiResponse.success(avaliacaoProfissionalService.listarPorProfissional(id));
    }
}
