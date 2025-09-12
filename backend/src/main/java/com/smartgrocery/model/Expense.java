package com.smartgrocery.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "expenses")
public class Expense {
    @Id
    private String id;
    private String userId;
    private String date; // ISO yyyy-MM-dd
    private double amount;
    private String store;
    private int items;
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getStore() { return store; }
    public void setStore(String store) { this.store = store; }
    public int getItems() { return items; }
    public void setItems(int items) { this.items = items; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}


