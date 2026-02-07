package com.example.StyleStore.repository;

import com.example.StyleStore.model.Category;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStatus(String status);

    interface CategoryStockProjection {
        Long getCategoryId();

        String getCategoryName();

        Long getTotalStock();
    }

    @Query(value = """
            SELECT c.id AS categoryId,
                   c.name AS categoryName,
                   COALESCE(SUM(ps.stock), 0) AS totalStock
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            LEFT JOIN product_sizes ps ON ps.product_id = p.id
            WHERE c.status = 'ACTIVE'
            GROUP BY c.id, c.name
            ORDER BY c.id
            """, nativeQuery = true)
    List<CategoryStockProjection> sumStockByCategory();
}
