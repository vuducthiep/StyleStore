package com.example.StyleStore.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportReceiptCreateRequest {
    private Long supplierId;
    private Long createdBy;
    private String note;
    private String status;
    private List<ImportReceiptItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportReceiptItemRequest {
        private Long productId;
        private Long sizeId;
        private Integer quantity;
        private Double importPrice;
    }
}
