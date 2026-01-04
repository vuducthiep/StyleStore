package com.example.StyleStore.service;

import com.example.StyleStore.dto.MonthlyRevenueDto;
import com.example.StyleStore.model.enums.OrderStatus;
import com.example.StyleStore.repository.OrderRepository;
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
}
