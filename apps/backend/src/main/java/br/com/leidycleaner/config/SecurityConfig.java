package br.com.leidycleaner.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.com.leidycleaner.auth.security.JwtAuthenticationFilter;
import br.com.leidycleaner.auth.security.JwtProperties;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties({SecurityProperties.class, JwtProperties.class})
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityProperties securityProperties,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            OncePerRequestFilter securityCorsHeadersFilter
    ) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/usuarios/profissionais/pre-cadastro-completo").permitAll()
                        .requestMatchers(securityProperties.publicEndpoints()).permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(securityCorsHeadersFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(SecurityProperties securityProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> configuredOrigins = Arrays.asList(securityProperties.corsAllowedOriginPatterns());

        configuration.setAllowedOrigins(configuredOrigins.stream()
                .filter(origin -> !origin.contains("*"))
                .toList());
        configuration.setAllowedOriginPatterns(configuredOrigins.stream()
                .filter(origin -> origin.contains("*"))
                .toList());

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin"
        ));

        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    OncePerRequestFilter securityCorsHeadersFilter(CorsConfigurationSource corsConfigurationSource) {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(
                    HttpServletRequest request,
                    HttpServletResponse response,
                    FilterChain filterChain
            ) throws ServletException, java.io.IOException {
                CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(request);
                String origin = request.getHeader(HttpHeaders.ORIGIN);

                if (configuration == null || origin == null || origin.isBlank()) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String allowedOrigin = configuration.checkOrigin(origin);
                if (allowedOrigin == null) {
                    filterChain.doFilter(request, response);
                    return;
                }

                response.setHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigin);
                response.setHeader(HttpHeaders.VARY, "Origin");

                if (configuration.getExposedHeaders() != null && !configuration.getExposedHeaders().isEmpty()) {
                    response.setHeader(
                            HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            String.join(",", configuration.getExposedHeaders())
                    );
                }

                boolean preflight = HttpMethod.OPTIONS.matches(request.getMethod())
                        && request.getHeader(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD) != null;

                if (preflight) {
                    response.setHeader(
                            HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                            String.join(",", configuration.getAllowedMethods())
                    );
                    response.setHeader(
                            HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                            configuration.getAllowedHeaders().stream().collect(Collectors.joining(","))
                    );
                    response.setStatus(HttpServletResponse.SC_OK);
                    return;
                }

                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
