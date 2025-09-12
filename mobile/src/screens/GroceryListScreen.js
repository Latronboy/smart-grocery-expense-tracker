import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Chip, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:8080/api';

export default function GroceryListScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'Produce', price: '', quantity: 1 });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/groceries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name) return;
    
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/groceries`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          price: parseFloat(newItem.price) || 0,
          quantity: parseInt(newItem.quantity) || 1,
          purchased: false
        })
      });
      
      if (response.ok) {
        const saved = await response.json();
        setItems([...items, saved]);
        setNewItem({ name: '', category: 'Produce', price: '', quantity: 1 });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const togglePurchased = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/groceries/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...item, purchased: !item.purchased })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setItems(items.map(i => i.id === id ? updated : i));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const deleteItem = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_BASE}/groceries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 204) {
        setItems(items.filter(i => i.id !== id));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.itemCard, item.purchased && styles.purchasedItem]}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Title style={item.purchased && styles.purchasedText}>{item.name}</Title>
          <Chip>{item.category}</Chip>
        </View>
        <Paragraph>
          {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
        </Paragraph>
        <View style={styles.itemActions}>
          <Button 
            mode={item.purchased ? "outlined" : "contained"}
            onPress={() => togglePurchased(item.id)}
            compact
          >
            {item.purchased ? 'Undo' : 'Buy'}
          </Button>
          <Button 
            mode="text" 
            onPress={() => deleteItem(item.id)}
            compact
            textColor="red"
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.addCard}>
        <Card.Content>
          <Title>Add Item</Title>
          <TextInput
            label="Item name"
            value={newItem.name}
            onChangeText={(text) => setNewItem({...newItem, name: text})}
            style={styles.input}
          />
          <TextInput
            label="Price"
            value={newItem.price}
            onChangeText={(text) => setNewItem({...newItem, price: text})}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Quantity"
            value={newItem.quantity.toString()}
            onChangeText={(text) => setNewItem({...newItem, quantity: parseInt(text) || 1})}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={addItem} style={styles.addButton}>
            Add to List
          </Button>
        </Card.Content>
      </Card>

      <FlatList
        data={items}
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
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    marginBottom: 8,
    elevation: 1,
  },
  purchasedItem: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchasedText: {
    textDecorationLine: 'line-through',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
