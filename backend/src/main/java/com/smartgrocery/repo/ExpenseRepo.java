package com.smartgrocery.repo;

import com.smartgrocery.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExpenseRepo extends MongoRepository<Expense, String> {
    List<Expense> findByUserId(String userId);
}
