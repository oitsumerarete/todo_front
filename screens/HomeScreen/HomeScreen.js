import React, { useCallback, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Avatar, ProgressBar, Card, Button, FAB } from 'react-native-paper';
import axios from 'axios';
import API_URL from '../../config';
import TodayTasks from './TodayTasks'
import MyOriginalPlans from './MyOriginalPlans';

export default function HomeScreen({navigation}) {
  const [todayTasks, setTodayTasks] = useState([]);
  const [userOriginalPlans, setUserOriginalPlans] = useState([]);

  const handleLogout = async () => {
      try {
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
      } catch (error) {
        console.log('Error clearing user token: ', error);
      }
  };

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

    // Fetch plans from the API
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTodayTasks(response.data.userPlan.todayTasks);
      setUserOriginalPlans(response.data.userOriginalPlans);
    } catch (err) {
      console.log(err)
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    }
  }, [getBearerToken]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
      <View style={styles.container}>
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

          {/* Task List */}
          <Card style={styles.taskCard}>
              <Card.Title title="Активные задачи на сегодня:" />
              <TodayTasks />
          </Card>
          
          <Button
          style={{
            marginTop: -10, 
            marginBottom: 10, 
            borderColor: 'blue', 
            borderWidth: 1}}
          onPress={() => navigation.navigate('PlanCreationScreen')}>Создать новый план</Button>

          <Card style={styles.taskCard}>
              <Card.Title title="Созданные планы:" />
              <MyOriginalPlans plans={userOriginalPlans} navigation={navigation}/>
          </Card>
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 10,
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
        padding: 14,
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
        zIndex: 1000,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
       
      },
      fab: {
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#3498db',
      },
      contentContainer: {
          flex: 1,
          padding: 16,
      },
      header: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
      },
      input: {
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 5,
          width: '100%',
          marginBottom: 15,
      },
  });
  