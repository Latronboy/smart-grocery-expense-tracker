package com.smartgrocery.repo;

import com.smartgrocery.model.GroceryItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GroceryRepo extends MongoRepository<GroceryItem, String> {
    List<GroceryItem> findByUserId(String userId);
}
