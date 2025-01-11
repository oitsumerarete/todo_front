import React from 'react';
import { FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MyOriginalPlans = ({ plans, navigation }) => {
  const renderItem = ({ item}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('PlanStoreScreen', { planId: item.planId })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.likes}>{item.likesCount} ❤️</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={plans}
      keyExtractor={(item) => item.planId.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  likes: {
    fontSize: 14,
    color: '#555',
  },
});

export default MyOriginalPlans;
