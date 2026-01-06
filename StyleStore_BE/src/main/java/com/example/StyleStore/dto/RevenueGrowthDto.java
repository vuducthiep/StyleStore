package com.example.StyleStore.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class RevenueGrowthDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private final int currentMonth;
    private final int currentYear;
    private final BigDecimal previousMonthRevenue;
    private final BigDecimal twoMonthsAgoRevenue;
    private final BigDecimal growthAmount;
    private final BigDecimal growthPercentage; // %

    public RevenueGrowthDto(int currentMonth, int currentYear, BigDecimal previousMonthRevenue,
            BigDecimal twoMonthsAgoRevenue, BigDecimal growthAmount, BigDecimal growthPercentage) {
        this.currentMonth = currentMonth;
        this.currentYear = currentYear;
        this.previousMonthRevenue = previousMonthRevenue;
        this.twoMonthsAgoRevenue = twoMonthsAgoRevenue;
        this.growthAmount = growthAmount;
        this.growthPercentage = growthPercentage;
    }

    public int getCurrentMonth() {
        return currentMonth;
    }

    public int getCurrentYear() {
        return currentYear;
    }

    public BigDecimal getPreviousMonthRevenue() {
        return previousMonthRevenue;
    }

    public BigDecimal getTwoMonthsAgoRevenue() {
        return twoMonthsAgoRevenue;
    }

    public BigDecimal getGrowthAmount() {
        return growthAmount;
    }

    public BigDecimal getGrowthPercentage() {
        return growthPercentage;
    }
}
