package com.example.StyleStore.service;

import com.example.StyleStore.dto.response.InventoryAlertResponse;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.User;
import org.springframework.data.domain.Page;

public interface InventoryAlertService {
    void createInsufficientStockAlert(User user, Product product, String message);

    Page<InventoryAlertResponse> getInventoryAlerts(int page, int size, String sortBy, String sortDir);

    Page<InventoryAlertResponse> filterInventoryAlertsByStatus(Integer status, int page, int size, String sortBy,
            String sortDir);

    InventoryAlertResponse markAlertAsProcessed(Long id);
}
