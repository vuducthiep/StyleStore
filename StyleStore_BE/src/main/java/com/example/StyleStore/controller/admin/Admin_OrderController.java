package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.response.ApiResponse;
import com.example.StyleStore.dto.response.OrderResponse;
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
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<OrderResponse> orders = orderService.getAllOrders(page, size, sortBy, sortDir);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Danh sách đơn hàng được tải thành công", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi tải danh sách đơn hàng: " + e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> searchOrders(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<OrderResponse> orders = orderService.searchOrders(keyword, status, page, size, sortBy, sortDir);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Tìm kiếm đơn hàng thành công", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi tìm kiếm đơn hàng: " + e.getMessage(), null));
        }
    }

    @GetMapping("/filter/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> filterOrdersByStatus(
            @RequestParam String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<OrderResponse> orders = orderService.filterOrdersByStatus(status, page, size, sortBy, sortDir);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Lọc đơn hàng theo trạng thái thành công", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Lỗi khi lọc đơn hàng: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.getOrderDetailById(id);
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
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.confirmOrder(id);
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
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.cancelOrder(id);
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
