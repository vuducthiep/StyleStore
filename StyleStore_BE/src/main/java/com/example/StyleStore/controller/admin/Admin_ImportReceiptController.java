package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.request.ImportReceiptCreateRequest;
import com.example.StyleStore.dto.response.ApiResponse;
import com.example.StyleStore.dto.response.ImportReceiptResponse;
import com.example.StyleStore.service.ImportReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import-receipts")
@RequiredArgsConstructor
public class Admin_ImportReceiptController {

    private final ImportReceiptService importReceiptService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImportReceiptResponse>> createImportReceipt(
            @RequestBody ImportReceiptCreateRequest request) {
        try {
            ImportReceiptResponse response = importReceiptService.createImportReceipt(request);
            return ResponseEntity.status(201).body(ApiResponse.ok("Nhap hang thanh cong", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Loi khi nhap hang: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ImportReceiptResponse>>> getImportReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status) {
        try {
            Page<ImportReceiptResponse> receipts = importReceiptService.getImportReceipts(
                    page, size, sortBy, sortDir, supplierId, status);
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phiếu nhập thành công", receipts));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Lỗi khi lấy danh sách phiếu nhập: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImportReceiptResponse>> getImportReceiptById(@PathVariable Long id) {
        try {
                ImportReceiptResponse response = importReceiptService.getImportReceiptById(id);
                return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết phiếu nhập thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Lỗi khi lấy chi tiết phiếu nhập: " + e.getMessage()));
        }
    }
}
