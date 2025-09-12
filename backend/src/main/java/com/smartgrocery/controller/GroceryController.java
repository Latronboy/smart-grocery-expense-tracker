package com.smartgrocery.controller;

import com.smartgrocery.config.JwtUtil;
import com.smartgrocery.model.GroceryItem;
import com.smartgrocery.repo.GroceryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/groceries")
@CrossOrigin(origins = "*", allowCredentials = "true")
public class GroceryController {

    @Autowired
    private GroceryRepo groceryRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private String getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) return null;
        return jwtUtil.getUsernameFromToken(token);
    }

    @GetMapping
    public ResponseEntity<List<GroceryItem>> getAllGroceries(@RequestHeader("Authorization") String authHeader) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groceryRepo.findByUserId(username));
    }

    @PostMapping
    public ResponseEntity<GroceryItem> createGrocery(@RequestHeader("Authorization") String authHeader, @RequestBody GroceryItem item) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        item.setUserId(username);
        item.setCreatedAt(Instant.now().toString());
        return ResponseEntity.ok(groceryRepo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroceryItem> updateGrocery(@RequestHeader("Authorization") String authHeader, @PathVariable String id, @RequestBody GroceryItem item) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        Optional<GroceryItem> existing = groceryRepo.findById(id);
        if (existing.isEmpty() || !existing.get().getUserId().equals(username)) {
            return ResponseEntity.notFound().build();
        }

        item.setId(id);
        item.setUserId(username);
        return ResponseEntity.ok(groceryRepo.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrocery(@RequestHeader("Authorization") String authHeader, @PathVariable String id) {
        String username = getCurrentUser(authHeader);
        if (username == null) return ResponseEntity.status(401).build();

        Optional<GroceryItem> existing = groceryRepo.findById(id);
        if (existing.isEmpty() || !existing.get().getUserId().equals(username)) {
            return ResponseEntity.notFound().build();
        }

        groceryRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
