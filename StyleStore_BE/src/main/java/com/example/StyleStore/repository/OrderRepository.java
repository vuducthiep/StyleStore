package com.example.StyleStore.repository;

import com.example.StyleStore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    interface MonthlyRevenueProjection {
        Integer getYear();

        Integer getMonth();

        BigDecimal getRevenue();
    }

    @Query(value = """
            SELECT YEAR(o.created_at)   AS year,
            			 MONTH(o.created_at)  AS month,
            			 COALESCE(SUM(o.total_amount), 0) AS revenue
            FROM orders o
            WHERE o.created_at >= :from AND o.created_at < :to
            	AND o.status = :completedStatus
            GROUP BY YEAR(o.created_at), MONTH(o.created_at)
            ORDER BY year, month
            """, nativeQuery = true)
    List<MonthlyRevenueProjection> sumRevenueByMonth(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("completedStatus") String completedStatus);

    @Query(value = """
            SELECT COALESCE(SUM(o.total_amount), 0) AS revenue
            FROM orders o
            WHERE YEAR(o.created_at) = :year AND MONTH(o.created_at) = :month
              AND o.status = :completedStatus
            """, nativeQuery = true)
    Optional<BigDecimal> getRevenueByYearMonth(
            @Param("year") int year,
            @Param("month") int month,
            @Param("completedStatus") String completedStatus);
}
