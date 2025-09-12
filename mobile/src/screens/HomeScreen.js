import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Smart Grocery</Title>
            <Paragraph>Manage your grocery list and track expenses</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('GroceryList')}
              style={styles.button}
            >
              Grocery List
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Expense')}
              style={styles.button}
            >
              Track Expenses
            </Button>
            <Button 
              mode="text" 
              onPress={handleLogout}
              style={styles.button}
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    marginVertical: 4,
  },
});
