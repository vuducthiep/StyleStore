package com.example.StyleStore.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportReceiptItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long sizeId;
    private String sizeName;
    private Integer quantity;
    private Double importPrice;
    private Double subtotal;
}
