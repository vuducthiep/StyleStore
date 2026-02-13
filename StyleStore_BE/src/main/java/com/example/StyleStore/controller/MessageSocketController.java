package com.example.StyleStore.controller;

import com.example.StyleStore.dto.MessageDto;
import com.example.StyleStore.dto.SocketMessageRequest;
import com.example.StyleStore.service.MessageService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageSocketController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(Principal principal, @Valid @Payload SocketMessageRequest request) {
        System.out.println("=== WebSocket /chat.send received ===");
        System.out.println("Principal: " + principal);
        System.out.println("Request: " + request);

        if (principal == null) {
            System.out.println("Principal is NULL - authentication failed");
            return;
        }

        MessageDto savedMessage = messageService.sendMessageFromEmail(
                principal.getName(),
                request.getReceiverUserId(),
                request.getContent());

        messagingTemplate.convertAndSend(
                "/topic/messages/" + request.getReceiverUserId(),
                savedMessage);
        messagingTemplate.convertAndSend(
                "/topic/messages/" + savedMessage.getSenderId(),
                savedMessage);
    }
}
