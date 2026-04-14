package com.example.StyleStore.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportReceiptResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long createdBy;
    private String note;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ImportReceiptItemResponse> items;
}
