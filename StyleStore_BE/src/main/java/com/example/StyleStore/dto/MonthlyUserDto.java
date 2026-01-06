package com.example.StyleStore.dto;

import java.io.Serializable;

public class MonthlyUserDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private final int year;
    private final int month;
    private final long count;

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
