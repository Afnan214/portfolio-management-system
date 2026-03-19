package com.tradetracker.pms.dto.response.auth;

public record AuthResponse(
        Long id,
        String email,
        String message
) {}