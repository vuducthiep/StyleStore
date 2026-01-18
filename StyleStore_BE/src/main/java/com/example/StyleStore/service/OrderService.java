package com.example.StyleStore.service;

import com.example.StyleStore.dto.MonthlyRevenueDto;
import com.example.StyleStore.dto.OrderDto;
import com.example.StyleStore.dto.OrderItemDto;
import com.example.StyleStore.dto.OrderRequest;
import com.example.StyleStore.dto.RevenueGrowthDto;
import com.example.StyleStore.model.*;
import com.example.StyleStore.model.enums.OrderStatus;
import com.example.StyleStore.repository.OrderItemRepository;
import com.example.StyleStore.repository.OrderRepository;
import com.example.StyleStore.repository.ProductRepository;
import com.example.StyleStore.repository.ProductSizeRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
            ProductRepository productRepository, ProductSizeRepository productSizeRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.productSizeRepository = productSizeRepository;
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
                previousMonth.getMonthValue(), OrderStatus.DELIVERED.name()).orElse(BigDecimal.ZERO);
        BigDecimal twoMonthsAgoRevenue = orderRepository.getRevenueByYearMonth(twoMonthsAgo.getYear(),
                twoMonthsAgo.getMonthValue(), OrderStatus.DELIVERED.name()).orElse(BigDecimal.ZERO);
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

    public Page<OrderDto> getAllOrders(int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Order> orders = orderRepository.findAll(pageRequest);
        return orders.map(this::convertToDto);
    }

    public OrderDto getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    public OrderDto getOrderDetailById(Long id) {
        return orderRepository.findById(id)
                .map(this::convertToDetailDto)
                .orElse(null);
    }

    public List<OrderDto> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private OrderDto convertToDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFullName())
                .phoneNumber(order.getUser().getPhoneNumber())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderDto convertToDetailDto(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());

        List<OrderItemDto> orderItemDtos = orderItems.stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImage(item.getProduct().getThumbnail())
                        .sizeId(item.getSize().getId())
                        .sizeName(item.getSize().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice() * item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFullName())
                .phoneNumber(order.getUser().getPhoneNumber())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(orderItemDtos)
                .build();
    }

    public OrderDto confirmOrder(long Id) {
        Order order = orderRepository.findById(Id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new RuntimeException("Only created orders can be confirmed");
        }

        order.setStatus(OrderStatus.SHIPPING);
        orderRepository.save(order);

        return convertToDto(order);
    }

    public OrderDto cancelOrder(long Id) {
        Order order = orderRepository.findById(Id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.SHIPPING && order.getStatus() != OrderStatus.CREATED) {
            throw new RuntimeException("Only shipping or created orders can be delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return convertToDto(order);
    }

    public OrderDto deliveredOrder(long Id) {
        Order order = orderRepository.findById(Id).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new RuntimeException("Only shipping orders can be delivered");
        }

        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        return convertToDto(order);
    }

    @Transactional
    public OrderDto createOrder(User user, OrderRequest request) {
        // 1. Validate request
        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống");
        }

        // 2. Tính tổng tiền
        Double totalAmount = request.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // 3. Tạo Order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 4. Tạo OrderItems từ request
        List<OrderItem> orderItems = request.getOrderItems().stream()
                .map(itemRequest -> {
                    // Kiểm tra Product tồn tại
                    Product product = productRepository.findById(itemRequest.getProductId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Sản phẩm với ID " + itemRequest.getProductId() + " không tồn tại"));

                    // Kiểm tra ProductSize tồn tại
                    ProductSize productSize = productSizeRepository
                            .findByProduct_IdAndSize_Id(itemRequest.getProductId(), itemRequest.getSizeId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Size không có sẵn cho sản phẩm này"));

                    // Kiểm tra stock đủ không
                    if (productSize.getStock() < itemRequest.getQuantity()) {
                        throw new RuntimeException(
                                "Sản phẩm " + product.getName() + ", size " + productSize.getSize().getName()
                                        + " chỉ còn " + productSize.getStock() + " cái");
                    }

                    // Giảm stock
                    productSize.setStock(productSize.getStock() - itemRequest.getQuantity());
                    productSizeRepository.save(productSize);

                    // Tạo OrderItem
                    return OrderItem.builder()
                            .order(savedOrder)
                            .product(product)
                            .size(productSize.getSize())
                            .quantity(itemRequest.getQuantity())
                            .price(itemRequest.getPrice())
                            .build();
                })
                .collect(Collectors.toList());

        List<OrderItem> savedOrderItems = orderItemRepository.saveAll(orderItems);

        // 5. Set orderItems vào savedOrder để convertToDetailDto có thể sử dụng
        savedOrder.setOrderItems(savedOrderItems);

        // 6. Return OrderDto
        return convertToDetailDto(savedOrder);
    }

}
