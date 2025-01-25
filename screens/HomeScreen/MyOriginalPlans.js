import React from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MyOriginalPlans = ({ plans, navigation, ListHeaderComponent, ListFooterComponent }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('PlanStoreScreen', { planId: item.planId })}
    >
      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.likesContainer}>
        <Icon name="heart" size={25} color="#76182a" />
        <Text style={styles.likesText}>{item.likesCount}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Попробуйте создать свой первый готовый план!</Text>
    </View>
  );

  return (
    <FlatList
      data={plans}
      keyExtractor={(item) => item.planId.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={renderEmptyComponent} // Компонент для пустого состояния
      contentContainerStyle={styles.contentContainer} // Стилизованный контейнер для FlatList
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 8,
    paddingBottom: 20, // Добавляем отступ внизу для комфортной прокрутки
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#76182a',
    textAlign: 'center',
  },
  itemContainer: {
    borderColor: '#76182a',
    borderWidth: 1,
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
  likesText: {
    fontSize: 16,
    color: '#76182a',
    marginLeft: 3,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MyOriginalPlans;
