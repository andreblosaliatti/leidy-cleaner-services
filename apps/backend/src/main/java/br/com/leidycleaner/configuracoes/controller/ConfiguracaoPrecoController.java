package br.com.leidycleaner.configuracoes.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.configuracoes.dto.ConfiguracaoPrecoDto;
import br.com.leidycleaner.configuracoes.dto.ConfiguracaoPrecoUpdateRequest;
import br.com.leidycleaner.configuracoes.service.ConfiguracaoPrecoService;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/admin/configuracoes/precos")
@PreAuthorize("hasRole('ADMIN')")
public class ConfiguracaoPrecoController {

    private final ConfiguracaoPrecoService configuracaoPrecoService;

    public ConfiguracaoPrecoController(ConfiguracaoPrecoService configuracaoPrecoService) {
        this.configuracaoPrecoService = configuracaoPrecoService;
    }

    @GetMapping
    public ApiResponse<ConfiguracaoPrecoDto> buscarAtiva() {
        return ApiResponse.success(configuracaoPrecoService.buscarAtiva());
    }

    @PutMapping
    public ApiResponse<ConfiguracaoPrecoDto> atualizarAtiva(
            @Valid @RequestBody ConfiguracaoPrecoUpdateRequest request
    ) {
        return ApiResponse.success(configuracaoPrecoService.atualizarAtiva(request));
    }
}
