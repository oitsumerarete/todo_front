import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, ProgressBar, Card, Button, FAB } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

export default function HomeScreen({navigation}) {
    const handleLogout = async () => {
        try {
          // Удаляем токен пользователя из AsyncStorage
          await AsyncStorage.removeItem('userToken');
          console.log('Token removed, logging out...');
    
          // Перенаправляем пользователя на экран логина
          navigation.replace('Login');
        } catch (error) {
          console.log('Error clearing user token: ', error);
        }
      };
  return (
    <ScrollView style={styles.container}>
      {/* Top Section: User Overview */}
      <View style={styles.topSection}>
        <Avatar.Image size={60} source={{ uri: 'https://www.1zoom.me/big2/62/199578-yana.jpg' }} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hello, world!</Text>
          <Text style={styles.userStatus}>Status: Focused</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <Card style={styles.progressCard}>
        <Card.Title title="Today's Plan Completion" />
        <ProgressBar progress={0.6} color="#3498db" style={styles.progressBar} />
        <Text style={styles.progressText}>60% Completed</Text>
      </Card>

      {/* Task List */}
      <Card style={styles.taskCard}>
        <Card.Title title="Active Tasks" />
        <View style={styles.taskItem}>
          <TouchableOpacity style={styles.checkbox} />
          <Text style={styles.taskText}>Finish React Native Project</Text>
        </View>
        <View style={styles.taskItem}>
          <TouchableOpacity style={styles.checkbox} />
          <Text style={styles.taskText}>Review PRs</Text>
        </View>
        <Button style={styles.addButton}>Add Task</Button>
      </Card>

      {/* Calendar Section */}
      <Card style={styles.calendarCard}>
        <Card.Title title="Upcoming Events" />
        <Calendar
          markedDates={{
            '2024-10-15': { marked: true, dotColor: 'blue' },
            '2024-10-16': { marked: true, dotColor: 'green' },
          }}
          theme={{
            calendarBackground: '#f9f9f9',
            textSectionTitleColor: '#2d4150',
            dayTextColor: '#2d4150',
            todayTextColor: '#00adf5',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: 'white',
            arrowColor: '#2d4150',
            monthTextColor: '#2d4150',
          }}
        />
      </Card>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => console.log('Create New Task or Plan')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userStatus: {
    fontSize: 14,
    color: '#757575',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  progressCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  progressBar: {
    marginTop: 16,
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#3498db',
  },
  taskCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    marginRight: 16,
  },
  taskText: {
    fontSize: 16,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: '#3498db',
  },
  calendarCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3498db',
  },
});
