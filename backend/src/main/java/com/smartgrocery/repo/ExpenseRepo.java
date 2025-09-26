package com.smartgrocery.repo;

import com.smartgrocery.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepo extends JpaRepository<Expense, String> {
    List<Expense> findByUserId(String userId);
}
