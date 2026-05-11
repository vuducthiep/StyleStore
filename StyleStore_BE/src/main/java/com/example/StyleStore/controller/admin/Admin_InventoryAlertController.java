package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.response.ApiResponse;
import com.example.StyleStore.dto.response.InventoryAlertResponse;
import com.example.StyleStore.service.InventoryAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/inventory-alerts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class Admin_InventoryAlertController {

    private final InventoryAlertService inventoryAlertService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<InventoryAlertResponse>>> getAllInventoryAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<InventoryAlertResponse> alerts = inventoryAlertService.getInventoryAlerts(page, size, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách cảnh báo tồn kho thành công", alerts));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Lỗi khi lấy danh sách cảnh báo tồn kho: " + e.getMessage()));
        }
    }

    @GetMapping("/filter/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<InventoryAlertResponse>>> filterInventoryAlertsByStatus(
            @RequestParam Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            if (status != 0 && status != 1) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Trạng thái cảnh báo không hợp lệ. Chỉ hỗ trợ 0 hoặc 1."));
            }

            Page<InventoryAlertResponse> alerts = inventoryAlertService
                    .filterInventoryAlertsByStatus(status, page, size, sortBy, sortDir);
            return ResponseEntity.ok(ApiResponse.ok("Lọc cảnh báo tồn kho theo trạng thái thành công", alerts));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Lỗi khi lọc cảnh báo tồn kho: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/processed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InventoryAlertResponse>> markAlertProcessed(@PathVariable Long id) {
        try {
            InventoryAlertResponse updated = inventoryAlertService.markAlertAsProcessed(id);
            return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái cảnh báo thành 'Đã xử lý'", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Lỗi khi cập nhật trạng thái cảnh báo: " + e.getMessage()));
        }
    }
}
