package com.example.StyleStore.repository;

import com.example.StyleStore.model.ImportReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportReceiptItemRepository extends JpaRepository<ImportReceiptItem, Long> {
    List<ImportReceiptItem> findByReceiptId(Long receiptId);
}
