package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.dto.OrderDto;
import com.example.StyleStore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class Admin_OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<OrderDto> orders = orderService.getAllOrders(page, size, sortBy, sortDir);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Danh sách đơn hàng được tải thành công", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi tải danh sách đơn hàng: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        try {
            OrderDto order = orderService.getOrderDetailById(id);
            if (order != null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Đơn hàng được tải thành công", order));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi tải đơn hàng: " + e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> confirmOrder(@PathVariable Long id) {
        try {
            OrderDto order = orderService.confirmOrder(id);
            if (order != null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Đơn hàng đã được xác nhận", order));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi xác nhận đơn hàng: " + e.getMessage(), null));
        }
    }

    // user and admin can cancel order
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(@PathVariable Long id) {
        try {
            OrderDto order = orderService.cancelOrder(id);
            if (order != null) {
                return ResponseEntity.ok(
                        new ApiResponse<>(true, "Đơn hàng đã được hủy", order));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi hủy đơn hàng: " + e.getMessage(), null));
        }
    }

}
