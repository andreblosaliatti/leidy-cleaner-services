package br.com.leidycleaner.convites.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.convites.dto.ConviteProfissionalDto;
import br.com.leidycleaner.convites.service.ConviteProfissionalService;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/convites")
public class ConviteProfissionalController {

    private final ConviteProfissionalService conviteProfissionalService;

    public ConviteProfissionalController(ConviteProfissionalService conviteProfissionalService) {
        this.conviteProfissionalService = conviteProfissionalService;
    }

    @GetMapping("/meus")
    public ApiResponse<List<ConviteProfissionalDto>> listarMeus(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(conviteProfissionalService.listarMeus(principal.getId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<ConviteProfissionalDto> buscar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id
    ) {
        return ApiResponse.success(conviteProfissionalService.buscarMeu(principal.getId(), id));
    }
}
