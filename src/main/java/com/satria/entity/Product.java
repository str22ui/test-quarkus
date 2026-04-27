package com.satria.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product extends PanacheEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public Double price;
}
