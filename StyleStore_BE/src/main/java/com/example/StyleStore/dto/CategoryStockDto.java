package com.example.StyleStore.dto;

import java.io.Serializable;

public class CategoryStockDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private final Long categoryId;
    private final String categoryName;
    private final Long totalStock;

    public CategoryStockDto(Long categoryId, String categoryName, Long totalStock) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalStock = totalStock;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Long getTotalStock() {
        return totalStock;
    }
}
