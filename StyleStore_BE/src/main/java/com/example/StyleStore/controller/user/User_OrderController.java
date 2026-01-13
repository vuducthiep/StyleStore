package com.example.StyleStore.controller.user;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.dto.OrderDto;
import com.example.StyleStore.dto.OrderRequest;
import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.UserRepository;
import com.example.StyleStore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class User_OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    // Lấy User từ token JWT
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("Không tìm thấy thông tin đăng nhập");
        }

        String email = authentication.getName();
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tìm thấy"));
    }

    // API lấy tất cả đơn hàng của user
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<OrderDto>>> getAllOrders() {
        try {
            User currentUser = getCurrentUser();
            java.util.List<OrderDto> orders = orderService.getOrdersByUserId(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách đơn hàng thành công", orders));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }

    // API tạo đơn hàng
    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@RequestBody OrderRequest request) {
        try {
            User currentUser = getCurrentUser();

            // Validate request
            if (request.getShippingAddress() == null || request.getShippingAddress().trim().isEmpty()) {
                return ResponseEntity.status(400).body(ApiResponse.fail("Địa chỉ giao hàng không được để trống"));
            }

            if (request.getPaymentMethod() == null) {
                return ResponseEntity.status(400).body(ApiResponse.fail("Vui lòng chọn phương thức thanh toán"));
            }

            if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
                return ResponseEntity.status(400).body(ApiResponse.fail("Danh sách sản phẩm không được để trống"));
            }

            OrderDto order = orderService.createOrder(currentUser, request);
            return ResponseEntity.status(201).body(ApiResponse.ok("Đặt hàng thành công", order));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // API lấy chi tiết đơn hàng
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderDetail(@PathVariable Long orderId) {
        try {
            OrderDto order = orderService.getOrderDetailById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(ApiResponse.fail("Không tìm thấy đơn hàng"));
            }
            return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết đơn hàng thành công", order));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }

    // API hủy đơn hàng
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(@PathVariable Long orderId) {
        try {
            User currentUser = getCurrentUser();

            // Kiểm tra đơn hàng có thuộc về user này không
            OrderDto order = orderService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(ApiResponse.fail("Không tìm thấy đơn hàng"));
            }

            if (!order.getUserId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body(ApiResponse.fail("Bạn không có quyền hủy đơn hàng này"));
            }

            OrderDto canceledOrder = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(ApiResponse.ok("Hủy đơn hàng thành công", canceledOrder));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi hệ thống: " + e.getMessage()));
        }
    }
}
