package com.example.StyleStore.service;

import com.example.StyleStore.dto.MonthlyRevenueDto;
import com.example.StyleStore.dto.RevenueGrowthDto;
import com.example.StyleStore.model.enums.OrderStatus;
import com.example.StyleStore.repository.OrderRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Cacheable(cacheNames = "stats:revenue:monthly", key = "'fixed'")
    public List<MonthlyRevenueDto> getRecent12MonthsRevenue() {
        YearMonth now = YearMonth.now();
        YearMonth start = now.minusMonths(11);
        LocalDateTime from = start.atDay(1).atStartOfDay();
        LocalDateTime to = now.plusMonths(1).atDay(1).atStartOfDay();

        Map<YearMonth, BigDecimal> aggregated = orderRepository
                .sumRevenueByMonth(from, to, OrderStatus.DELIVERED.name())
                .stream()
                .collect(Collectors.toMap(
                        r -> YearMonth.of(r.getYear(), r.getMonth()),
                        OrderRepository.MonthlyRevenueProjection::getRevenue));

        List<MonthlyRevenueDto> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            YearMonth ym = start.plusMonths(i);
            BigDecimal revenue = aggregated.getOrDefault(ym, BigDecimal.ZERO);
            result.add(new MonthlyRevenueDto(ym.getYear(), ym.getMonthValue(), revenue));
        }
        return result;
    }

    @Cacheable(cacheNames = "stats:revenue:growth", key = "'fixed'")
    public RevenueGrowthDto getRevenueGrowth() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth twoMonthsAgo = currentMonth.minusMonths(2);
        BigDecimal previousMonthRevenue = orderRepository.getRevenueByYearMonth(previousMonth.getYear(),
                previousMonth.getMonthValue(), OrderStatus.DELIVERED.name());
        BigDecimal twoMonthsAgoRevenue = orderRepository.getRevenueByYearMonth(twoMonthsAgo.getYear(),
                twoMonthsAgo.getMonthValue(), OrderStatus.DELIVERED.name());
        BigDecimal growth;
        BigDecimal growthPercentage;
        // Calculate growth percentage
        if (twoMonthsAgoRevenue.compareTo(BigDecimal.ZERO) == 0) {
            if (previousMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
                growth = previousMonthRevenue;
                growthPercentage = BigDecimal.valueOf(100);
            } else {
                growth = BigDecimal.ZERO;
                growthPercentage = BigDecimal.ZERO; // cả hai đều 0
            }
        } else {
            growth = previousMonthRevenue.subtract(twoMonthsAgoRevenue);
            growthPercentage = growth
                    .divide(twoMonthsAgoRevenue, 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return new RevenueGrowthDto(
                currentMonth.getMonthValue(),
                currentMonth.getYear(),
                previousMonthRevenue,
                twoMonthsAgoRevenue,
                growth,
                growthPercentage);
    }

}
