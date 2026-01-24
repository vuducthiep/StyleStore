package com.example.StyleStore.service;

import com.example.StyleStore.model.Category;
import com.example.StyleStore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByStatus("ACTIVE");
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Category createCategory(Category category) {
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + id));

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setStatus(categoryDetails.getStatus());
        category.setUpdatedAt(LocalDateTime.now());

        return categoryRepository.save(category);
    }
}
