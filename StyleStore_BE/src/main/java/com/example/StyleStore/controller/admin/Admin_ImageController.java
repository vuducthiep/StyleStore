package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/upload")
@CrossOrigin(origins = "*")
public class Admin_ImageController {

    @Autowired
    private ImageUploadService imageUploadService;

    @PostMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.fail("File ảnh không được để trống"));
            }

            String imageUrl = imageUploadService.uploadImage(image);
            return ResponseEntity.ok(ApiResponse.ok("Upload ảnh thành công", Map.of("url", imageUrl)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi khi upload ảnh: " + e.getMessage()));
        }
    }
}
