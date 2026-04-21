package br.com.leidycleaner.profissionais.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
import br.com.leidycleaner.profissionais.dto.AnalisarProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.AtualizarPerfilProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.DefinirRegioesProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.DisponibilidadeProfissionalDto;
import br.com.leidycleaner.profissionais.dto.DisponibilidadeProfissionalRequest;
import br.com.leidycleaner.profissionais.dto.PerfilProfissionalResumoDto;
import br.com.leidycleaner.profissionais.service.PerfilProfissionalService;
import br.com.leidycleaner.profissionais.service.ProfissionalOnboardingService;
import br.com.leidycleaner.regioes.dto.RegiaoAtendimentoDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/profissionais")
public class ProfissionalController {

    private final PerfilProfissionalService perfilProfissionalService;
    private final ProfissionalOnboardingService profissionalOnboardingService;

    public ProfissionalController(
            PerfilProfissionalService perfilProfissionalService,
            ProfissionalOnboardingService profissionalOnboardingService
    ) {
        this.perfilProfissionalService = perfilProfissionalService;
        this.profissionalOnboardingService = profissionalOnboardingService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<PerfilProfissionalResumoDto> meuPerfil(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(perfilProfissionalService.buscarMeuPerfil(principal.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<PerfilProfissionalResumoDto> atualizarMeuPerfil(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody AtualizarPerfilProfissionalRequest request
    ) {
        return ApiResponse.success(perfilProfissionalService.atualizarMeuPerfil(principal.getId(), request));
    }

    @PostMapping("/me/regioes")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<List<RegiaoAtendimentoDto>> definirRegioes(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody DefinirRegioesProfissionalRequest request
    ) {
        return ApiResponse.success(profissionalOnboardingService.definirMinhasRegioes(principal.getId(), request));
    }

    @GetMapping("/me/regioes")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<List<RegiaoAtendimentoDto>> minhasRegioes(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(profissionalOnboardingService.listarMinhasRegioes(principal.getId()));
    }

    @PostMapping("/me/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<DisponibilidadeProfissionalDto> criarDisponibilidade(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody DisponibilidadeProfissionalRequest request
    ) {
        return ApiResponse.success(profissionalOnboardingService.criarDisponibilidade(principal.getId(), request));
    }

    @GetMapping("/me/disponibilidades")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<List<DisponibilidadeProfissionalDto>> minhasDisponibilidades(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(profissionalOnboardingService.listarDisponibilidades(principal.getId()));
    }

    @PutMapping("/me/disponibilidades/{id}")
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public ApiResponse<DisponibilidadeProfissionalDto> atualizarDisponibilidade(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody DisponibilidadeProfissionalRequest request
    ) {
        return ApiResponse.success(profissionalOnboardingService.atualizarDisponibilidade(principal.getId(), id, request));
    }

    @DeleteMapping("/me/disponibilidades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PROFISSIONAL')")
    public void excluirDisponibilidade(@AuthenticationPrincipal UsuarioPrincipal principal, @PathVariable Long id) {
        profissionalOnboardingService.excluirDisponibilidade(principal.getId(), id);
    }

    @PatchMapping("/{id}/aprovacao")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PerfilProfissionalResumoDto> analisarProfissional(
            @PathVariable Long id,
            @Valid @RequestBody AnalisarProfissionalRequest request
    ) {
        return ApiResponse.success(perfilProfissionalService.analisarProfissional(id, request));
    }
}
