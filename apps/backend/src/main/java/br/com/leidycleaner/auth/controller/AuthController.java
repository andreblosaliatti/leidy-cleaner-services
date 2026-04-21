package br.com.leidycleaner.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.auth.dto.AuthLoginRequest;
import br.com.leidycleaner.auth.dto.AuthLoginResponse;
import br.com.leidycleaner.auth.dto.UsuarioAutenticadoDto;
import br.com.leidycleaner.auth.mapper.AuthMapper;
import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.auth.service.AuthService;
import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthLoginResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<UsuarioAutenticadoDto> me(@AuthenticationPrincipal UsuarioPrincipal principal) {
        return ApiResponse.success(AuthMapper.paraUsuarioAutenticado(principal));
    }
}
