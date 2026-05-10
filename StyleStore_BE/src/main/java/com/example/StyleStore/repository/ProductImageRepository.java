package com.example.StyleStore.repository;

import com.example.StyleStore.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrder(Long productId);
    void deleteByProductId(Long productId);
}
