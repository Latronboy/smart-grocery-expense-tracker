package com.smartgrocery.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartgrocery.model.User;

public interface UserRepo extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
}


