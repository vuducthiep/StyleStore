package com.example.StyleStore.service.impl;

import com.example.StyleStore.dto.response.InventoryAlertResponse;
import com.example.StyleStore.model.InventoryAlert;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.InventoryAlertRepository;
import com.example.StyleStore.service.InventoryAlertService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryAlertServiceImpl implements InventoryAlertService {

    private final InventoryAlertRepository inventoryAlertRepository;

    public InventoryAlertServiceImpl(InventoryAlertRepository inventoryAlertRepository) {
        this.inventoryAlertRepository = inventoryAlertRepository;
    }

    @Override
    @Transactional
    public InventoryAlertResponse markAlertAsProcessed(Long id) {
        InventoryAlert alert = inventoryAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cảnh báo không tồn tại: " + id));

        alert.setStatus(1);
        InventoryAlert saved = inventoryAlertRepository.save(alert);
        return toResponse(saved);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createInsufficientStockAlert(User user, Product product, String message) {
        inventoryAlertRepository.save(InventoryAlert.builder()
                .user(user)
                .product(product)
                .message(message)
                .status(0)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryAlertResponse> getInventoryAlerts(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return inventoryAlertRepository.findAll(pageRequest).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryAlertResponse> filterInventoryAlertsByStatus(Integer status, int page, int size,
            String sortBy, String sortDir) {
        if (status == null) {
            return getInventoryAlerts(page, size, sortBy, sortDir);
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return inventoryAlertRepository.findByStatus(status, pageRequest).map(this::toResponse);
    }

    private InventoryAlertResponse toResponse(InventoryAlert alert) {
        return InventoryAlertResponse.builder()
                .id(alert.getId())
                .productId(alert.getProduct() != null ? alert.getProduct().getId() : null)
                .productName(alert.getProduct() != null ? alert.getProduct().getName() : null)
                .userId(alert.getUser() != null ? alert.getUser().getId() : null)
                .userName(alert.getUser() != null ? alert.getUser().getFullName() : null)
                .message(alert.getMessage())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
