package com.example.StyleStore.controller.user;

import com.example.StyleStore.dto.ApiResponse;
import com.example.StyleStore.model.Category;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.service.CategoryService;
import com.example.StyleStore.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/user/products")
@CrossOrigin(origins = "*")
public class User_ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    // Lấy danh sách sản phẩm (có phân trang)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = productService.getProducts(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách sản phẩm thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product
                .map(p -> ResponseEntity.ok(ApiResponse.ok("Lấy sản phẩm thành công", p)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.fail("Không tìm thấy sản phẩm")));
    }

    // Lấy sản phẩm theo danh mục (có phân trang)
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        // Tìm danh mục
        Optional<Category> category = categoryService.getCategoryById(categoryId);
        if (category.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.fail("Không tìm thấy danh mục"));
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = productService.getProductsByCategory(category.get(), pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách sản phẩm theo danh mục thành công", result));
    }

}
