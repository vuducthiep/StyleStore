package com.example.StyleStore.repository;

import com.example.StyleStore.model.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    Optional<ProductSize> findByProduct_IdAndSize_Id(Long productId, Long sizeId);
}
