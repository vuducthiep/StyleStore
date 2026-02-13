package com.example.StyleStore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocketMessageRequest {
    @NotNull
    private Long receiverUserId;

    @NotBlank
    private String content;
}
