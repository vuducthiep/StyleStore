package com.example.StyleStore.dto.response.stats;

import java.io.Serializable;

public class MonthlyUserDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private int year;
    private int month;
    private long count;

    public MonthlyUserDto() {
        // No-args constructor for Jackson
    }

    public MonthlyUserDto(int year, int month, long count) {
        this.year = year;
        this.month = month;
        this.count = count;
    }

    public int getYear() {
        return year;
    }

    public int getMonth() {
        return month;
    }

    public long getCount() {
        return count;
    }
}
