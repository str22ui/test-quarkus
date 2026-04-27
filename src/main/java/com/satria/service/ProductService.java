package com.satria.service;

import com.satria.entity.Product;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.Optional;

@ApplicationScoped
public class ProductService {

    @Transactional
    public Optional<Product> update(Long id, Product data) {
        Product existing = Product.findById(id);
        if (existing == null) {
            return Optional.empty();
        }
        existing.name  = data.name;
        existing.price = data.price;
        // Panache auto-merges within an active transaction — no explicit persist() needed
        return Optional.of(existing);
    }
}
