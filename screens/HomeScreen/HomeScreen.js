import React, { useCallback, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Avatar, Card, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import API_URL from '../../config';
import TodayTasks from './TodayTasks';
import MyOriginalPlans from './MyOriginalPlans';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Убедись, что эта библиотека установлена


export default function HomeScreen({ navigation }) {
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasksLength, setCompletedTasksLength] = useState(0);
  const [userOriginalPlans, setUserOriginalPlans] = useState([]);
  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

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

  useEffect(() => {
    setCompletedTasksLength(todayTasks?.filter((task) => task.status === 'done')?.length || 0)
  }, [todayTasks])

  const handleSettingsPress = () => {
    // Обработчик нажатия на шестерёнку
    console.log('Settings pressed');
  };

  const renderHeader = () => (
    <>
      {/* Top Section: User Overview */}
      <View style={styles.topSection}>
        <Avatar.Image
          size={60}
          source={{ uri: 'https://www.1zoom.me/big2/62/199578-yana.jpg' }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hello, world!</Text>
          <Text style={styles.userStatus}>Status: Focused</Text>
        </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() =>
          navigation.navigate('Настройки')
        }>
          <Icon name="settings" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Task List */}

      <TouchableOpacity onPress={() => navigation.navigate('Мой план')} >
      <Card style={styles.taskCard}>
        <View style={styles.container}>
          <Text style={styles.text}>
            {`Задачи выполнены: ${completedTasksLength} из ${todayTasks?.length || 0}`}
          </Text>
          <ProgressBar 
            progress={completedTasksLength / todayTasks?.length || 0} 
            color="#c20020" 
            style={styles.progressBar} 
          />
          {/* Разделитель */}
          <View style={styles.separator} />
        </View>
        <Card.Title
          style={{ paddingLeft: 10 }}
          titleStyle={{ fontSize: 20 }}
          title="Активные задачи на сегодня:"
        />

        <TodayTasks 
          data={todayTasks
            ?.sort((a, b) => {
              if (a.status === "done" && b.status !== "done") {
                return 1;
              } else if (a.status !== "done" && b.status === "done") {
                return -1;
              } else {
                return 0;
              }
            })
            .slice(0, 5)}
        />
      </Card>

      </TouchableOpacity>

      <Button
        style={{
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
    height: 12,
    borderRadius: 5,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userStatus: {
    fontSize: 14,
    color: 'gray',
  },
  settingsButton: {
    padding: 5,
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
  text: {
    fontSize: 16,
  },
  taskCard: {
    borderColor: '#76182a',
    borderWidth: 0.2,
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  separator: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Светло-серый цвет
  },
});
