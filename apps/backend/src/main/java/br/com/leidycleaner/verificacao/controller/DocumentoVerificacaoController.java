package br.com.leidycleaner.verificacao.controller;

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
import br.com.leidycleaner.verificacao.dto.AnalisarDocumentoVerificacaoRequest;
import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoDto;
import br.com.leidycleaner.verificacao.dto.DocumentoVerificacaoRequest;
import br.com.leidycleaner.verificacao.service.DocumentoVerificacaoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/verificacoes")
public class DocumentoVerificacaoController {

    private final DocumentoVerificacaoService documentoVerificacaoService;

    public DocumentoVerificacaoController(DocumentoVerificacaoService documentoVerificacaoService) {
        this.documentoVerificacaoService = documentoVerificacaoService;
    }

    @PostMapping("/documentos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<DocumentoVerificacaoDto> registrar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody DocumentoVerificacaoRequest request
    ) {
        return ApiResponse.success(documentoVerificacaoService.registrar(principal.getId(), request));
    }

    @GetMapping("/minha")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<DocumentoVerificacaoDto> minha(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(documentoVerificacaoService.minhaVerificacao(principal.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<DocumentoVerificacaoDto>> listarTodas() {
        return ApiResponse.success(documentoVerificacaoService.listarTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DocumentoVerificacaoDto> buscar(@PathVariable Long id) {
        return ApiResponse.success(documentoVerificacaoService.buscarPorId(id));
    }

    @PatchMapping("/{id}/analisar")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DocumentoVerificacaoDto> analisar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AnalisarDocumentoVerificacaoRequest request
    ) {
        return ApiResponse.success(documentoVerificacaoService.analisar(id, principal.getId(), request));
    }
}
