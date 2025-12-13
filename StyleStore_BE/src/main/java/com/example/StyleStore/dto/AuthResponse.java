package com.example.StyleStore.dto;

public record AuthResponse(
        String accessToken,
        Long userId,
        String fullName,
        String email,
        String role) {
}