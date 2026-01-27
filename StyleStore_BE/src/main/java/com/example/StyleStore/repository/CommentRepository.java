package com.example.StyleStore.repository;

import com.example.StyleStore.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Lấy tất cả comment của 1 sản phẩm với phân trang
    Page<Comment> findByProductId(Long productId, Pageable pageable);

    // Lấy tất cả comment của 1 user
    Page<Comment> findByUserId(Long userId, Pageable pageable);

    // Lấy tất cả comment của 1 sản phẩm (không phân trang)
    List<Comment> findByProductId(Long productId);

    // Đếm số lượng comment của 1 sản phẩm
    long countByProductId(Long productId);

}
