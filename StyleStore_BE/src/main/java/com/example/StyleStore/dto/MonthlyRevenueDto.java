package com.example.StyleStore.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class MonthlyRevenueDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private final int year;
    private final int month;
    private final BigDecimal revenue;

    public MonthlyRevenueDto(int year, int month, BigDecimal revenue) {
        this.year = year;
        this.month = month;
        this.revenue = revenue;
    }

    public int getYear() {
        return year;
    }

    public int getMonth() {
        return month;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }
}
