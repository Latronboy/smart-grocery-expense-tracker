import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, FAB } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:8080/api';

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    amount: '', 
    store: '', 
    items: '' 
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.store) return;
    
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: newExpense.date,
          amount: parseFloat(newExpense.amount),
          store: newExpense.store,
          items: parseInt(newExpense.items) || 0
        })
      });
      
      if (response.ok) {
        const saved = await response.json();
        setExpenses([saved, ...expenses]);
        setNewExpense({ 
          date: new Date().toISOString().split('T')[0], 
          amount: '', 
          store: '', 
          items: '' 
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 204) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete expense');
    }
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderItem = ({ item }) => (
    <Card style={styles.expenseCard}>
      <Card.Content>
        <View style={styles.expenseHeader}>
          <Title>{item.store}</Title>
          <Title style={styles.amount}>${item.amount.toFixed(2)}</Title>
        </View>
        <Paragraph>Date: {item.date}</Paragraph>
        <Paragraph>Items: {item.items}</Paragraph>
        <Button 
          mode="text" 
          onPress={() => deleteExpense(item.id)}
          textColor="red"
          compact
        >
          Delete
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.addCard}>
        <Card.Content>
          <Title>Add Expense</Title>
          <TextInput
            label="Date"
            value={newExpense.date}
            onChangeText={(text) => setNewExpense({...newExpense, date: text})}
            style={styles.input}
          />
          <TextInput
            label="Amount"
            value={newExpense.amount}
            onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Store"
            value={newExpense.store}
            onChangeText={(text) => setNewExpense({...newExpense, store: text})}
            style={styles.input}
          />
          <TextInput
            label="Items"
            value={newExpense.items}
            onChangeText={(text) => setNewExpense({...newExpense, items: text})}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={addExpense} style={styles.addButton}>
            Add Expense
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Total Spent: ${totalSpent.toFixed(2)}</Title>
        </Card.Content>
      </Card>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 8,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expenseCard: {
    marginBottom: 8,
    elevation: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    color: '#d32f2f',
  },
});
