package com.example.StyleStore.repository;

import com.example.StyleStore.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCart_IdAndProduct_IdAndSize_Id(Long cartId, Long productId, Long sizeId);

    List<CartItem> findByCart_Id(Long cartId);

    void deleteByCart_Id(Long cartId);
}
