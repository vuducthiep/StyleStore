package com.example.StyleStore.service;

import com.example.StyleStore.dto.MessageDto;
import com.example.StyleStore.dto.ChatUserDto;
import com.example.StyleStore.model.Message;
import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.MessageRepository;
import com.example.StyleStore.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;

        public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
                this.messageRepository = messageRepository;
                this.userRepository = userRepository;
        }

        private String getCurrentUserEmail() {
                return SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();
        }

        private User getCurrentUser() {
                String userEmail = getCurrentUserEmail();
                return userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }

        @Transactional
        public MessageDto sendMessage(Long receiverUserId, String content) {
                User sender = getCurrentUser();
                User receiver = userRepository.findById(receiverUserId)
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content)
                                .build();

                Message savedMessage = messageRepository.save(message);
                return toDto(savedMessage);
        }

        @Transactional
        public MessageDto sendMessageFrom(Long senderUserId, Long receiverUserId, String content) {
                User sender = userRepository.findById(senderUserId)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User receiver = userRepository.findById(receiverUserId)
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content)
                                .build();

                Message savedMessage = messageRepository.save(message);
                return toDto(savedMessage);
        }

        @Transactional
        public MessageDto sendMessageFromEmail(String senderEmail, Long receiverUserId, String content) {
                User sender = userRepository.findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User receiver = userRepository.findById(receiverUserId)
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(content)
                                .build();

                Message savedMessage = messageRepository.save(message);
                return toDto(savedMessage);
        }

        @Transactional(readOnly = true)
        public List<MessageDto> getConversation(Long otherUserId) {
                User currentUser = getCurrentUser();
                List<Message> messages = messageRepository.findConversation(currentUser.getId(), otherUserId);
                return messages.stream()
                                .map(this::toDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public int markConversationRead(Long otherUserId) {
                User currentUser = getCurrentUser();
                return messageRepository.markReadBetween(otherUserId, currentUser.getId());
        }

        @Transactional(readOnly = true)
        public List<ChatUserDto> getChatUsers() {
                User currentUser = getCurrentUser();
                List<MessageRepository.ChatUserProjection> users = messageRepository
                                .findDistinctChatUsers(currentUser.getId());
                return users.stream()
                                .map(user -> ChatUserDto.builder()
                                                .id(user.getId())
                                                .fullName(user.getFullName())
                                                .email(user.getEmail())
                                                .build())
                                .collect(Collectors.toList());
        }

        private MessageDto toDto(Message message) {
                return MessageDto.builder()
                                .id(message.getId())
                                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                                .receiverId(message.getReceiver() != null ? message.getReceiver().getId() : null)
                                .content(message.getContent())
                                .isRead(message.isRead())
                                .createdAt(message.getCreatedAt())
                                .build();
        }
}
