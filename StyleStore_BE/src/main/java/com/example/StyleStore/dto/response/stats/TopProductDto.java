package com.example.StyleStore.dto.response.stats;

import java.io.Serializable;

public class TopProductDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private final Long productId;
    private final String productName;
    private final String productThumbnail;
    private final Long totalSold;

    public TopProductDto(Long productId, String productName, String productThumbnail, Long totalSold) {
        this.productId = productId;
        this.productName = productName;
        this.productThumbnail = productThumbnail;
        this.totalSold = totalSold;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getProductThumbnail() {
        return productThumbnail;
    }

    public Long getTotalSold() {
        return totalSold;
    }
}
