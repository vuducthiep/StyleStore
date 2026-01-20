package com.example.StyleStore.repository;

import com.example.StyleStore.model.Category;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    long count();

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByCategoryAndStatus(Category category, ProductStatus status, Pageable pageable);

}
