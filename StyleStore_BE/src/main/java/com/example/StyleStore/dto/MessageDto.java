package com.example.StyleStore.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
}
