package br.com.leidycleaner.core.dto;

import java.util.List;

public record ApiErrorResponse(
        boolean success,
        String code,
        String message,
        List<String> errors
) {

    public static ApiErrorResponse of(String code, String message, List<String> errors) {
        return new ApiErrorResponse(false, code, message, errors);
    }
}
