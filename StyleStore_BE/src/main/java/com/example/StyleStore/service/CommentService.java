package com.example.StyleStore.service;

import com.example.StyleStore.dto.CommentDTO;
import com.example.StyleStore.dto.CreateCommentRequest;
import com.example.StyleStore.dto.UpdateCommentRequest;
import com.example.StyleStore.model.Comment;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.CommentRepository;
import com.example.StyleStore.repository.ProductRepository;
import com.example.StyleStore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @Transactional
    public CommentDTO createComment(CreateCommentRequest request) {
        String userEmail = getCurrentUserEmail();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(
                        () -> new RuntimeException("Product not found with id: " + request.getProductId()));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .product(product)
                .user(user)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }

    @Transactional
    public CommentDTO updateComment(Long commentId, UpdateCommentRequest request) {
        String userEmail = getCurrentUserEmail();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Kiểm tra xem comment có thuộc về user này không
        if (!comment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to update this comment");
        }

        comment.setContent(request.getContent());

        Comment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        String userEmail = getCurrentUserEmail();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Kiểm tra xem comment có thuộc về user này không
        if (!comment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentDTO> getCommentsByProductId(Long productId, Pageable pageable) {
        // Kiểm tra product có tồn tại không
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        Page<Comment> comments = commentRepository.findByProductId(productId, pageable);
        return comments.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<CommentDTO> getCommentsByUserId(Long userId, Pageable pageable) {
        // Kiểm tra user có tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        Page<Comment> comments = commentRepository.findByUserId(userId, pageable);
        return comments.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public long getCommentCount(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }

        return commentRepository.countByProductId(productId);
    }

    private CommentDTO convertToDTO(Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .productId(comment.getProduct().getId())
                .productName(comment.getProduct().getName())
                .userId(comment.getUser().getId())
                .userFullName(comment.getUser().getFullName())
                .userEmail(comment.getUser().getEmail())
                .build();
    }
}
