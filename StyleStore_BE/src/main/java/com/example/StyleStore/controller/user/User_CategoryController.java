package com.example.StyleStore.controller.user;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Category;
import com.example.StyleStore.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/user/categories")
public class User_CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getCategory() {
        try {
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách danh mục thành công", categories));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách danh mục thất bại", null));
        }
    }

}
