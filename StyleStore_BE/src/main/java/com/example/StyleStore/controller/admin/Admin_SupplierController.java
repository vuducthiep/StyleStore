package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.request.SupplierCreateRequest;
import com.example.StyleStore.dto.request.SupplierUpdateRequest;
import com.example.StyleStore.dto.response.ApiResponse;
import com.example.StyleStore.dto.response.SupplierResponse;
import com.example.StyleStore.service.ImportReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/suppliers")
@RequiredArgsConstructor
public class Admin_SupplierController {

    private final ImportReceiptService importReceiptService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<SupplierResponse>>> getSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword) {
        Page<SupplierResponse> suppliers = importReceiptService
                .getSuppliers(page, size, sortBy, sortDir, keyword);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách nhà cung cấp thành công", suppliers));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@RequestBody SupplierCreateRequest request) {
        try {
            SupplierResponse response = importReceiptService.createSupplier(request);
            return ResponseEntity.status(201).body(ApiResponse.ok("Tạo nhà cung cấp thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Lỗi khi tạo nhà cung cấp: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(@PathVariable Long id,
                                                                         @RequestBody SupplierUpdateRequest request) {
        try {
            SupplierResponse response = importReceiptService.updateSupplier(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Cập nhật nhà cung cấp thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Lỗi khi cập nhật nhà cung cấp: " + e.getMessage()));
        }
    }
}
