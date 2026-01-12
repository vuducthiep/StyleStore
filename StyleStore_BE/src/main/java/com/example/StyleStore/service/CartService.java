package com.example.StyleStore.service;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Cart;
import com.example.StyleStore.model.CartItem;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.Size;
import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.CartRepository;
import com.example.StyleStore.repository.CartItemRepository;
import com.example.StyleStore.repository.ProductRepository;
import com.example.StyleStore.repository.SizeRepository;
import com.example.StyleStore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final SizeRepository sizeRepository;
    private final UserRepository userRepository;

    // Lấy giỏ hàng của user
    public Cart getCartByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));
    }

    // Thêm sản phẩm vào giỏ hàng
    public CartItem addToCart(Long userId, Long productId, Long sizeId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        Cart cart = getCartByUserId(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Size size = sizeRepository.findById(sizeId)
                .orElseThrow(() -> new RuntimeException("Size không tồn tại"));

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        Optional<CartItem> existingItem = cartItemRepository.findByCart_IdAndProduct_IdAndSize_Id(
                cart.getId(), productId, sizeId);

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Cập nhật số lượng nếu sản phẩm đã có
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setUpdatedAt(LocalDateTime.now());
        } else {
            // Tạo CartItem mới
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .size(size)
                    .quantity(quantity)
                    .price(product.getPrice())
                    .build();
        }

        cartItem = cartItemRepository.save(cartItem);

        // Cập nhật tổng giá
        updateCartTotalPrice(cart);

        return cartItem;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public void removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getCartByUserId(userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Không có quyền xóa sản phẩm này");
        }

        cartItemRepository.deleteById(cartItemId);

        // Cập nhật tổng giá
        updateCartTotalPrice(cart);
    }

    // Cập nhật số lượng sản phẩm
    public CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }

        Cart cart = getCartByUserId(userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Không có quyền cập nhật sản phẩm này");
        }

        cartItem.setQuantity(quantity);
        cartItem.setUpdatedAt(LocalDateTime.now());
        cartItem = cartItemRepository.save(cartItem);

        return cartItem;
    }

    // Xóa toàn bộ sản phẩm trong giỏ
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cartItemRepository.deleteByCart_Id(cart.getId());
        cartRepository.save(cart);
    }

    // (Không cần updateCartTotalPrice nữa - tính tự động từ @Transient)
    private void updateCartTotalPrice(Cart cart) {
        // Method này giữ lại để tương thích, nhưng không làm gì
        // Vì totalPrice sẽ được tính tự động từ getTotalPrice()
    }
}
