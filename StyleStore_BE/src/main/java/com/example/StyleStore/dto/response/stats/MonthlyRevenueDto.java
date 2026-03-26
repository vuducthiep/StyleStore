package com.example.StyleStore.dto.response.stats;

import java.io.Serializable;
import java.math.BigDecimal;

public class MonthlyRevenueDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private int year;
    private int month;
    private BigDecimal revenue;

    public MonthlyRevenueDto() {
        // No-args constructor for Jackson
    }

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
