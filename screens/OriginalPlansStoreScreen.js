import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';

const AllPlansStoreScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // For filtering by category
  const [planCategories, setPlanCategories] = useState([]);

  // Function to get the bearer token
  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/original/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilteredPlans(response.data);
      setPlanCategories(['Все', 'Туризм', 'Фитнес', 'Образование', 'Здоровье', 'Бизнес']);
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

  const handleSearchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/original/plans?searchQuery=${searchQuery}&categories=${selectedCategories.join(`,`)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFilteredPlans(response.data);
      setPlanCategories(['Все', 'Туризм', 'Фитнес', 'Образование', 'Здоровье', 'Бизнес']);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, [getBearerToken, searchQuery, selectedCategories]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);


  useEffect(() => {
    if (selectedCategories.includes('Все') && selectedCategories.length > 1) {
      setSelectedCategories('Все');
    }
  }, [selectedCategories])

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

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
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Найди свой план!"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPlans}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {planCategories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategories((prevItems) =>
              prevItems.includes(category)
                ? prevItems.filter((item) => item !== category) // Удаляем элемент, если он уже есть
                : [...prevItems, category] // Добавляем элемент, если его нет
            )}
            style={[
              styles.filterButton,
              selectedCategories.includes(category) && styles.activeFilterButton,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategories.includes(category) && styles.activeFilterButtonText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!loading && filteredPlans.length === 0 && 
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Такие планы не найдены</Text>
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
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
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingBottom: 7,
    maxHeight: 47,
    marginBottom: 10,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AllPlansStoreScreen;
