package com.smartgrocery.repo;

import com.smartgrocery.model.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroceryRepo extends JpaRepository<GroceryItem, String> {
    List<GroceryItem> findByUserId(String userId);
}
