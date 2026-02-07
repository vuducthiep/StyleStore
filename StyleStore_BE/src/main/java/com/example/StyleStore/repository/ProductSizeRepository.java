package com.example.StyleStore.repository;

import com.example.StyleStore.model.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    Optional<ProductSize> findByProduct_IdAndSize_Id(Long productId, Long sizeId);

    @Query(value = "SELECT COALESCE(SUM(ps.stock), 0) FROM product_sizes ps", nativeQuery = true)
    Long sumTotalStock();
}
