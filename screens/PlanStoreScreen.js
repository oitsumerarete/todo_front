import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/plans';

const PlanStoreScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBearerToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      return token;
    } catch (error) {
      throw new Error('Failed to retrieve token');
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [getBearerToken]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('DetailedPlan', { planId: item.planId })}
    >
      <View style={styles.planContainer}>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.details}>{item.details}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        <Text style={styles.likes}>Likes: {item.likesCount}</Text>
        <Text style={styles.date}>Created At: {new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
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
        renderItem={renderPlanItem}
        keyExtractor={item => item.planId.toString()}
        showsVerticalScrollIndicator={false}
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

export default PlanStoreScreen;
