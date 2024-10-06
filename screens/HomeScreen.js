import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login'); // Вернуться на экран логина
  };

  const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZW1haWwiOiJMZW9wb2xkLktpaG5AaG90bWFpbC5jbyIsImlhdCI6MTcyODI0MzQ3NCwiZXhwIjoxNzI4MjQ3MDc0fQ.b13wVwKsSiCKkdIaiNEaIje5LC8YhxtJdsQcbkcmoz8';

  const fetchPlans = async () => {
      try {
          setLoading(true);
          const response = await axios.get('http://localhost:3000/plans', {
              headers: {
                  Authorization: `Bearer ${bearerToken}`,
              },
          });
          console.log(response)
          setPlans(response.data);
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchPlans();
  }, []);

  const PlanItem = ({ item }) => (
    <View style={styles.planContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.details}>{item.details}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        <Text style={styles.likes}>Likes: {item.likesCount}</Text>
        <Text style={styles.date}>Created At: {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return (
        <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }

  if (error) {
      return (
          <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
            <FlatList
                data={plans}
                renderItem={PlanItem}
                keyExtractor={item => item.planId.toString()}
            />
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
  },
  planContainer: {
      marginBottom: 20,
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#f9f9f9',
  },
  title: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  description: {
      fontSize: 16,
      marginVertical: 5,
  },
  details: {
      fontSize: 14,
      color: '#555',
  },
  category: {
      fontSize: 14,
      fontStyle: 'italic',
  },
  likes: {
      fontSize: 14,
      color: '#007BFF',
  },
  date: {
      fontSize: 12,
      color: '#aaa',
  },
  loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  errorText: {
      color: 'red',
      fontSize: 16,
  },
});

export default HomeScreen;
