package com.example.StyleStore.controller.user;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Cart;
import com.example.StyleStore.model.CartItem;
import com.example.StyleStore.service.CartService;
import com.example.StyleStore.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.web.bind.annotation.*;
import com.example.StyleStore.repository.UserRepository;

@RestController
@RequestMapping("/api/user/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class User_CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    // Lấy user ID từ token JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("Không tìm thấy thông tin đăng nhập");
        }

        // Ưu tiên lấy userId được set trong Authentication details
        Object details = authentication.getDetails();
        if (details instanceof Long) {
            return (Long) details;
        }

        // Fallback: lấy email và truy DB để lấy userId
        String email = authentication.getName();
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tìm thấy"))
                .getId();
    }

    // Lấy giỏ hàng của user
    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart() {
        try {
            Long userId = getCurrentUserId();
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(ApiResponse.ok("Lấy giỏ hàng thành công", cart));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartItem>> addToCart(
            @RequestParam Long productId,
            @RequestParam Long sizeId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        try {
            Long userId = getCurrentUserId();
            CartItem cartItem = cartService.addToCart(userId, productId, sizeId, quantity);
            return ResponseEntity.status(201).body(ApiResponse.ok("Thêm sản phẩm vào giỏ thành công", cartItem));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable Long cartItemId) {
        try {
            Long userId = getCurrentUserId();
            cartService.removeFromCart(userId, cartItemId);
            return ResponseEntity.ok(ApiResponse.ok("Xóa sản phẩm khỏi giỏ thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }

    // Xóa toàn bộ giỏ hàng
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        try {
            Long userId = getCurrentUserId();
            cartService.clearCart(userId);
            return ResponseEntity.ok(ApiResponse.ok("Xóa giỏ hàng thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi: " + e.getMessage()));
        }
    }
}
