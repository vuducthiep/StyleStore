package com.example.StyleStore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Long sizeId;
    private String sizeName;
    private Integer quantity;
    private Double price;
    private Double subtotal;
}
