package com.example.StyleStore.repository;

import com.example.StyleStore.model.InventoryAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryAlertRepository extends JpaRepository<InventoryAlert, Long> {
	Page<InventoryAlert> findByStatus(Integer status, Pageable pageable);
}
