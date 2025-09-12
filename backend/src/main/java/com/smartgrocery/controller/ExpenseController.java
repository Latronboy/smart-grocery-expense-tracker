package com.smartgrocery.controller;

import com.smartgrocery.config.JwtUtil;
import com.smartgrocery.model.Expense;
import com.smartgrocery.repo.ExpenseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*", allowCredentials = "true")
public class ExpenseController {

    @Autowired
    private ExpenseRepo expenseRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private String getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) return null;
        return jwtUtil.getUsernameFromToken(token);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses(@RequestHeader("Authorization") String authHeader) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(expenseRepo.findByUserId(username));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestHeader("Authorization") String authHeader, @RequestBody Expense expense) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        expense.setUserId(username);
        expense.setCreatedAt(Instant.now().toString());
        return ResponseEntity.ok(expenseRepo.save(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@RequestHeader("Authorization") String authHeader, @PathVariable String id, @RequestBody Expense expense) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        Optional<Expense> existing = expenseRepo.findById(id);
        if (existing.isEmpty() || !existing.get().getUserId().equals(username)) {
            return ResponseEntity.notFound().build();
        }

        expense.setId(id);
        expense.setUserId(username);
        return ResponseEntity.ok(expenseRepo.save(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@RequestHeader("Authorization") String authHeader, @PathVariable String id) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        Optional<Expense> existing = expenseRepo.findById(id);
        if (existing.isEmpty() || !existing.get().getUserId().equals(username)) {
            return ResponseEntity.notFound().build();
        }

        expenseRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
