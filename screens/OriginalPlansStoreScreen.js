import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/original/plans'; // Adjust this based on your environment

const AllPlansStoreScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(''); // For filtering by category

  const planCategories = ['All', 'Weight Loss', 'Muscle Mass', 'Endurance', 'Flexibility'];

  // Function to get the bearer token
  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  // Fetch plans from the API
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data);
      setFilteredPlans(response.data); // Initialize filtered plans
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, [getBearerToken]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Filter plans based on search query and category
  useEffect(() => {
    let filtered = plans;

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((plan) => plan.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((plan) =>
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlans(filtered);
  }, [searchQuery, selectedCategory, plans]);

  // Render individual plan item
  const renderPlanItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PlanStoreScreen', { planId: item.planId })}
      activeOpacity={0.7}
    >
      <View style={styles.planContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.details}>{item.details}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        <Text style={styles.likes}>Likes: {item.likesCount}</Text>
        <Text style={styles.date}>Created At: {formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Loading indicator
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Error handling with retry button
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchPlans} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the list of plans with search and filter options
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a plan..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {planCategories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category && styles.activeFilterButtonText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!loading && filteredPlans.length === 0 && 
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No plans available at the moment</Text>
        </View>
      }

      {/* Plan List */}
      <FlatList
        data={filteredPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.planId.toString()}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 7,
    marginBottom: 20,
    padding: '10px',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#007BFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007BFF',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  planContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AllPlansStoreScreen;
