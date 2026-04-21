package br.com.leidycleaner.enderecos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.enderecos.dto.EnderecoDto;
import br.com.leidycleaner.enderecos.dto.EnderecoRequest;
import br.com.leidycleaner.enderecos.service.EnderecoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;

    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EnderecoDto> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody EnderecoRequest request
    ) {
        return ApiResponse.success(enderecoService.criar(principal.getId(), request));
    }

    @GetMapping("/meus")
    public ApiResponse<List<EnderecoDto>> listarMeus(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(enderecoService.listarMeus(principal.getId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<EnderecoDto> atualizar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody EnderecoRequest request
    ) {
        return ApiResponse.success(enderecoService.atualizar(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        enderecoService.excluir(principal.getId(), id);
    }
}
