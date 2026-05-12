package com.example.StyleStore.controller.user;

import com.example.StyleStore.dto.response.ApiResponse;
import com.example.StyleStore.model.Category;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.ProductImage;
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

import java.util.List;
import java.util.Optional;
import com.example.StyleStore.dto.response.stats.BestSellingProductsInCategoriesDTO;
import com.example.StyleStore.service.OrderService;

@RestController
@RequestMapping("/api/user/products")
@CrossOrigin(origins = "*")
public class User_ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private OrderService orderService;

    // Lấy danh sách sản phẩm (có phân trang và lọc theo giới tính)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String gender) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> result = (gender != null && !gender.trim().isEmpty())
                ? productService.getProductsByGender(gender, pageable)
                : productService.getProducts(pageable);
        
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
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String gender) {

        // Tìm danh mục
        Optional<Category> category = categoryService.getCategoryById(categoryId);
        if (category.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.fail("Không tìm thấy danh mục"));
        }

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = (gender != null && !gender.trim().isEmpty())
            ? productService.getProductsByCategoryAndGender(category.get(), gender, pageable)
            : productService.getProductsByCategory(category.get(), pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách sản phẩm theo danh mục thành công", result));
    }

    // search products by name with pagination
    @GetMapping("/search/{name}")
    public ResponseEntity<ApiResponse<Page<Product>>> searchProductsByName(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = productService.searchProductsByName(name, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Tìm kiếm sản phẩm thành công", result));
    }

    // Lấy các hình ảnh phụ của sản phẩm
    @GetMapping("/{productId}/images")
    public ResponseEntity<ApiResponse<List<ProductImage>>> getProductImages(@PathVariable Long productId) {
        try {
            List<ProductImage> images = productService.getProductImages(productId);
            return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách hình ảnh thành công", images));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.fail("Lỗi khi lấy hình ảnh: " + e.getMessage()));
        }
    }

    // Lấy top 5 sản phẩm bán chạy (tùy chọn theo danh mục)
    @GetMapping("/best-selling/top5")
    public ResponseEntity<ApiResponse<List<com.example.StyleStore.dto.response.stats.TopProductDto>>> getTop5BestSellingProducts(
            @RequestParam(name = "categoryId", required = false) Long categoryId) {
        try {
            List<com.example.StyleStore.dto.response.stats.TopProductDto> result =
                    (categoryId == null)
                            ? orderService.getTop5ProductsOverall()
                            : orderService.getTop5ProductsByCategory(categoryId);
            return ResponseEntity.ok(ApiResponse.ok("Lấy top 5 sản phẩm bán chạy thành công", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("Lỗi server: " + e.getMessage()));
        }
    }

}
