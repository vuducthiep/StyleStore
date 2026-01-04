package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.dto.MonthlyRevenueDto;
import com.example.StyleStore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "*")
public class Admin_StatsController {

    private final OrderService orderService;

    public Admin_StatsController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/revenue/monthly-recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueDto>>> getRecent12MonthsRevenue() {
        List<MonthlyRevenueDto> result = orderService.getRecent12MonthsRevenue();
        return ResponseEntity.ok(ApiResponse.ok("Lấy doanh thu 12 tháng gần nhất thành công", result));
    }
}
