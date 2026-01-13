package com.example.StyleStore.dto;

import com.example.StyleStore.model.enums.PaymentMethod;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private String shippingAddress;
    private PaymentMethod paymentMethod;
}
