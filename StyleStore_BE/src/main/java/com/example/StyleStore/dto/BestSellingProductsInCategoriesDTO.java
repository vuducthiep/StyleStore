package com.example.StyleStore.dto;

public interface BestSellingProductsInCategoriesDTO {

    long getCategoryId();

    String getCategoryName();

    long getProductId();

    String getProductName();

    long getTotalSold();
}
