package com.example.StyleStore.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierUpdateRequest {
    private String name;
    private String phone;
    private String email;
    private String address;
    private String status;
    private String note;
}
