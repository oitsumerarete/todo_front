import React, { useCallback, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Avatar, Card, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import API_URL from '../../config';
import TodayTasks from './TodayTasks';
import MyOriginalPlans from './MyOriginalPlans';

export default function HomeScreen({ navigation }) {
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


  console.log(todayTasks)

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTodayTasks(response.data?.userPlan?.todayTasks);
      setUserOriginalPlans(response.data?.userOriginalPlans);
    } catch (err) {
      console.log(err);
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

  const completedTasks = todayTasks.filter((task) => task.status === 'done').length;

  const renderHeader = () => (
    <>
      {/* Top Section: User Overview */}
      <View style={styles.topSection}>
        <Avatar.Image size={60} source={{ uri: 'https://www.1zoom.me/big2/62/199578-yana.jpg' }} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hello, world!</Text>
          <Text style={styles.userStatus}>Status: Focused</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}

      <TouchableOpacity onPress={() => navigation.navigate('Мой план')} >
      <Card style={styles.taskCard}>
          <View style={styles.container}>
            <Text style={styles.text}>
              {`Задачи выполнены: ${completedTasks} из ${todayTasks.length}`}
            </Text>
            <ProgressBar progress={completedTasks / todayTasks.length || 0} color="#6200ee" style={styles.progressBar} />
        </View>
        <Card.Title
          style={{ paddingLeft: 10 }}
          titleStyle={{ fontSize: 20 }}
          title="Активные задачи на сегодня:"
        />

        <TodayTasks data={todayTasks.slice(0, 5)}/>
      </Card>
      </TouchableOpacity>

      <Button
        style={{
          marginTop: -10,
          marginBottom: 10,
          borderColor: '#76182a',
          backgroundColor: '#76182a',
          borderWidth: 1,
        }}
        labelStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate('PlanCreationScreen')}
      >
        Создать новый план
      </Button>


      {userOriginalPlans && <Card.Title
          style={{ paddingLeft: 3 }}
          titleStyle={{ fontSize: 20 }}
          title="Ваши созданные планы:"
        />}
    </>
  );

  return (
    <View style={styles.container}>
      <MyOriginalPlans
        plans={userOriginalPlans}
        navigation={navigation}
        ListHeaderComponent={renderHeader} // Передаем шапку как свойство
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  progressBar: {
    marginTop: 5,
    width: '100%',
    height: 10,
    borderRadius: 5,
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
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    fontWeight: 'bold',
  },
  taskCard: {
    borderColor: '#76182a',
    borderWidth: 0.2,
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
});
