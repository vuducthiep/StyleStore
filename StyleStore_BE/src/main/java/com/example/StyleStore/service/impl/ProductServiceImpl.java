package com.example.StyleStore.service.impl;

import com.example.StyleStore.dto.response.stats.CategoryStockDto;
import com.example.StyleStore.model.Category;
import com.example.StyleStore.model.Product;
import com.example.StyleStore.model.ProductImage;
import com.example.StyleStore.model.ProductSize;
import com.example.StyleStore.model.Size;
import com.example.StyleStore.model.enums.ProductStatus;
import com.example.StyleStore.repository.CategoryRepository;
import com.example.StyleStore.repository.ProductImageRepository;
import com.example.StyleStore.repository.ProductRepository;
import com.example.StyleStore.repository.ProductSizeRepository;
import com.example.StyleStore.repository.SizeRepository;
import com.example.StyleStore.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {


    public ProductServiceImpl(ProductRepository productRepository, SizeRepository sizeRepository, ProductSizeRepository productSizeRepository, CategoryRepository categoryRepository, ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.sizeRepository = sizeRepository;
        this.productSizeRepository = productSizeRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Override
    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Page<Product> getProductsByCategory(Category category, Pageable pageable) {
        return productRepository.findByCategoryAndStatus(category, ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Page<Product> getProductsByGender(String gender, Pageable pageable) {
        return productRepository.findByGenderAndStatus(gender, ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product createProduct(Product product) {
        List<Size> allSizes = sizeRepository.findAll();
        List<ProductSize> productSizes = new ArrayList<>();
        for (Size size : allSizes) {
            Integer stock = 0;
            if (product.getProductSizes() != null) {
                for (ProductSize ps : product.getProductSizes()) {
                    if (ps.getSize() != null && ps.getSize().getId().equals(size.getId())) {
                        stock = ps.getStock() != null ? ps.getStock() : 0;
                        break;
                    }
                }
            }
            productSizes.add(ProductSize.builder()
                    .product(product)
                    .size(size)
                    .stock(stock)
                    .build());
        }
        product.setProductSizes(productSizes);
        return productRepository.save(product);
    }

    @Override
    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }
        productRepository.deleteById(id);
        return true;
    }

    @Override
    public Product updateProduct(Long id, Product newProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    if (newProduct.getName() != null) product.setName(newProduct.getName());
                    if (newProduct.getDescription() != null) product.setDescription(newProduct.getDescription());
                    if (newProduct.getGender() != null) product.setGender(newProduct.getGender());
                    if (newProduct.getBrand() != null) product.setBrand(newProduct.getBrand());
                    if (newProduct.getMaterial() != null) product.setMaterial(newProduct.getMaterial());
                    if (newProduct.getColor() != null) product.setColor(newProduct.getColor());
                    if (newProduct.getPrice() != null) product.setPrice(newProduct.getPrice());
                    if (newProduct.getThumbnail() != null) product.setThumbnail(newProduct.getThumbnail());
                    if (newProduct.getStatus() != null) product.setStatus(newProduct.getStatus());
                    if (newProduct.getCategory() != null) product.setCategory(newProduct.getCategory());

                    if (newProduct.getProductSizes() != null && !newProduct.getProductSizes().isEmpty()) {
                        // Update existing sizes' stock when matching by productSize.id
                        // Also add new ProductSize records when a size (size.id) is provided but not present for this product
                        for (var newSize : newProduct.getProductSizes()) {
                            // If incoming model contains productSize id, try to update existing by id
                            if (newSize.getId() != null) {
                                for (var existingSize : product.getProductSizes()) {
                                    if (existingSize.getId().equals(newSize.getId())) {
                                        if (newSize.getStock() != null) {
                                            existingSize.setStock(newSize.getStock());
                                        }
                                        break;
                                    }
                                }
                            } else if (newSize.getSize() != null && newSize.getSize().getId() != null) {
                                Long sizeId = newSize.getSize().getId();
                                // Check if a ProductSize for this product & size already exists
                                var existing = productSizeRepository.findByProduct_IdAndSize_Id(product.getId(), sizeId);
                                if (existing.isPresent()) {
                                    var ex = existing.get();
                                    if (newSize.getStock() != null) {
                                        ex.setStock(newSize.getStock());
                                        productSizeRepository.save(ex);
                                    }
                                } else {
                                    // create new ProductSize record
                                    var sizeEntity = sizeRepository.findById(sizeId).orElse(null);
                                    if (sizeEntity != null) {
                                        ProductSize ps = ProductSize.builder()
                                                .product(product)
                                                .size(sizeEntity)
                                                .stock(newSize.getStock() != null ? newSize.getStock() : 0)
                                                .build();
                                        ProductSize saved = productSizeRepository.save(ps);
                                        // attach to product in-memory for response
                                        product.getProductSizes().add(saved);
                                    }
                                }
                            }
                        }
                    }

                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Override
    @Cacheable(cacheNames = "stats:products:count", key = "'fixed'")
    public long getTotalProductCount() {
           long count = productRepository.count();
           return count;
    }

    @Override
    public long getTotalStock() {
        Long total = productSizeRepository.sumTotalStock();
        return total != null ? total : 0L;
    }

    @Override
    public List<CategoryStockDto> getStockByCategory() {
        return categoryRepository.sumStockByCategory().stream()
                .map(item -> new CategoryStockDto(
                        item.getCategoryId(),
                        item.getCategoryName(),
                        item.getTotalStock()))
                .collect(Collectors.toList());
    }

    @Override
    public Page<Product> searchProductsByName(String name, Pageable pageable) {
        return productRepository.searchByName(name, ProductStatus.ACTIVE, pageable);
    }

    @Override
    public Page<Product> searchProductsByNameOrCategory(String keyword, Pageable pageable) {
        return productRepository.searchByNameOrCategory(keyword, ProductStatus.ACTIVE, pageable);
    }

    @Override
    public List<ProductImage> getProductImages(Long productId) {
        return productImageRepository.findByProductIdOrderByDisplayOrder(productId);
    }

    @Override
    public ProductImage addProductImage(Long productId, ProductImage productImage) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        productImage.setProduct(product.get());
        return productImageRepository.save(productImage);
    }

    @Override
    public ProductImage updateProductImage(Long imageId, ProductImage productImage) {
        return productImageRepository.findById(imageId)
                .map(image -> {
                    if (productImage.getImageUrl() != null) {
                        image.setImageUrl(productImage.getImageUrl());
                    }
                    if (productImage.getDisplayOrder() != null) {
                        image.setDisplayOrder(productImage.getDisplayOrder());
                    }
                    return productImageRepository.save(image);
                })
                .orElseThrow(() -> new RuntimeException("Product image not found with id: " + imageId));
    }

    @Override
    public boolean deleteProductImage(Long imageId) {
        if (!productImageRepository.existsById(imageId)) {
            return false;
        }
        productImageRepository.deleteById(imageId);
        return true;
    }
}
