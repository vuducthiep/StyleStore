package com.example.StyleStore.dto.request;

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
