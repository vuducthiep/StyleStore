package com.example.StyleStore.controller.admin;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Category;
import com.example.StyleStore.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "*")
public class Admin_CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách danh mục thành công", categories));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        try {
            if (category.getName() == null || category.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Tên danh mục không được để trống"));
            }

            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(ApiResponse.ok("Tạo danh mục thành công", createdCategory));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Lỗi tạo danh mục: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {
        try {
            if (category.getName() == null || category.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Tên danh mục không được để trống"));
            }

            Category updatedCategory = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(ApiResponse.ok("Cập nhật danh mục thành công", updatedCategory));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Lỗi cập nhật danh mục: " + e.getMessage()));
        }
    }
}
