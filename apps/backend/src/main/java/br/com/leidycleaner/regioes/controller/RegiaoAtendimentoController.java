package br.com.leidycleaner.regioes.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.regioes.dto.RegiaoAtendimentoDto;
import br.com.leidycleaner.regioes.service.RegiaoAtendimentoService;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/regioes")
public class RegiaoAtendimentoController {

    private final RegiaoAtendimentoService regiaoAtendimentoService;

    public RegiaoAtendimentoController(RegiaoAtendimentoService regiaoAtendimentoService) {
        this.regiaoAtendimentoService = regiaoAtendimentoService;
    }

    @GetMapping
    public ApiResponse<List<RegiaoAtendimentoDto>> listarAtivas() {
        return ApiResponse.success(regiaoAtendimentoService.listarAtivas());
    }
}
