package com.example.StyleStore.service;

import com.example.StyleStore.model.Product;
import com.example.StyleStore.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }
        productRepository.deleteById(id);
        return true;
    }

    public Product updateProduct(Long id, Product newProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    if (newProduct.getName() != null) {
                        product.setName(newProduct.getName());
                    }
                    if (newProduct.getDescription() != null) {
                        product.setDescription(newProduct.getDescription());
                    }
                    if (newProduct.getGender() != null) {
                        product.setGender(newProduct.getGender());
                    }
                    if (newProduct.getPrice() != null) {
                        product.setPrice(newProduct.getPrice());
                    }
                    if (newProduct.getThumbnail() != null) {
                        product.setThumbnail(newProduct.getThumbnail());
                    }
                    if (newProduct.getStatus() != null) {
                        product.setStatus(newProduct.getStatus());
                    }
                    if (newProduct.getCategory() != null) {
                        product.setCategory(newProduct.getCategory());
                    }

                    // Cập nhật stock của ProductSize
                    if (newProduct.getProductSizes() != null && !newProduct.getProductSizes().isEmpty()) {
                        product.getProductSizes().forEach(existingSize -> {
                            newProduct.getProductSizes().forEach(newSize -> {
                                if (existingSize.getId().equals(newSize.getId())) {
                                    if (newSize.getStock() != null) {
                                        existingSize.setStock(newSize.getStock());
                                    }
                                }
                            });
                        });
                    }

                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
}