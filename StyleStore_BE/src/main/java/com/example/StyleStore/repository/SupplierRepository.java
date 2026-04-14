package com.example.StyleStore.repository;

import com.example.StyleStore.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByNameIgnoreCase(String name);

    @Query("""
            SELECT s FROM Supplier s
            WHERE (:keyword IS NULL
                OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.phone, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Supplier> search(@Param("keyword") String keyword, Pageable pageable);
}
