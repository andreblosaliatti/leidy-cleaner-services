package br.com.leidycleaner.pagamentos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.leidycleaner.core.ApiPaths;
import br.com.leidycleaner.core.dto.ApiResponse;
import br.com.leidycleaner.pagamentos.service.WebhookService;
import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/webhooks")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/asaas")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> receberWebhookAsaas(
            @RequestHeader(value = "asaas-access-token", required = false) String accessToken,
            @Valid @RequestBody String payload
    ) {
        webhookService.processarWebhookAsaas(accessToken, payload);
        return ApiResponse.success(null);
    }
}
