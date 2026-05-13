package br.com.leidycleaner.creditos.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.creditos.dto.CreditoSolicitacaoDto;
import br.com.leidycleaner.creditos.dto.UsoCreditoSolicitacaoDto;
import br.com.leidycleaner.creditos.entity.StatusCreditoSolicitacao;
import br.com.leidycleaner.creditos.service.CreditoSolicitacaoService;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/creditos-solicitacao")
public class CreditoSolicitacaoController {

    private final CreditoSolicitacaoService creditoSolicitacaoService;

    public CreditoSolicitacaoController(CreditoSolicitacaoService creditoSolicitacaoService) {
        this.creditoSolicitacaoService = creditoSolicitacaoService;
    }

    @GetMapping("/meus")
    public ApiResponse<List<CreditoSolicitacaoDto>> listarMeus(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @RequestParam(required = false) StatusCreditoSolicitacao status
    ) {
        return ApiResponse.success(creditoSolicitacaoService.listarMeus(principal.getId(), status));
    }

    @PostMapping("/{creditoId}/usar-em-solicitacao/{solicitacaoId}")
    public ApiResponse<UsoCreditoSolicitacaoDto> usarEmSolicitacao(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long creditoId,
            @PathVariable Long solicitacaoId
    ) {
        return ApiResponse.success(creditoSolicitacaoService.usarEmSolicitacao(principal.getId(), creditoId, solicitacaoId));
    }
}
