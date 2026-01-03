package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Size;
import com.example.StyleStore.service.SizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sizes")
public class Admin_SizeController {
    @Autowired
    private SizeService sizeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Size>>> getSizes() {
        List<Size> sizes = sizeService.getAllSizes();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách size thành công", sizes));
    }
}
