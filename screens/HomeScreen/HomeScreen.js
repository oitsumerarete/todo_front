import React, { useCallback, useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Avatar, Card, Button, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import API_URL from '../../config';
import TodayTasks from './TodayTasks';
import MyOriginalPlans from './MyOriginalPlans';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedTasksLength, setCompletedTasksLength] = useState(0);
  const [userOriginalPlans, setUserOriginalPlans] = useState([]);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [])
  );

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

      setUsername(response.data?.user?.username);
      setUserAvatar(response.data?.user?.avatar);
      setTodayTasks(response.data?.userPlan?.todayTasks || []);
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
    setCompletedTasksLength(
      todayTasks?.filter((task) => task.status === 'done')?.length || 0
    );
  }, [todayTasks]);

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const renderHeader = () => {
    // Отфильтруем активные задачи (те, что не выполнены)
    const activeTasks =
      todayTasks?.filter((task) => task.status !== 'done') || [];

    return (
      <>
        {/* Верхняя секция: информация о пользователе */}
        <View style={styles.topSection}>
          {userAvatar && (
            <Avatar.Image size={60} source={{ uri: userAvatar }} />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{username}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Настройки')}
          >
            <Icon name="settings" size={30} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Блок задач */}
        <TouchableOpacity onPress={() => navigation.navigate('Мой план')}>
          <Card style={styles.taskCard}>
            {todayTasks.length > 0 && <View style={styles.container}>
              <Text style={styles.text}>
                {`Задачи выполнены: ${completedTasksLength} из ${todayTasks?.length || 0}`}
              </Text>
              <ProgressBar
                progress={
                  todayTasks?.length > 0
                    ? completedTasksLength / todayTasks.length
                    : 0
                }
                color="#c20020"
                style={styles.progressBar}
              />
              {/* Разделитель */}
              <View style={styles.separator} />
            </View>}
            {todayTasks.length > 0 && <Card.Title
              style={{ paddingLeft: 10 }}
              titleStyle={{ fontSize: 20 }}
              title="Активные задачи на сегодня:"
            />}

            {todayTasks.length > 0 ? (
              // Если активные задачи есть – показываем их (сортировка по статусу может быть дополнительно добавлена)
              <TodayTasks data={todayTasks.slice(0, 5)} />
            ) : (
              // Если активных задач нет – выводим сообщение
              <Text style={styles.noTasksText}>
                Пока активных задач на сегодня нет, начните новый план!
              </Text>
            )}
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
          onPress={() => navigation.navigate('PlanInfo')}
        >
          Создать новый план
        </Button>

        {userOriginalPlans && (
          <Card.Title
            style={{ paddingLeft: 3 }}
            titleStyle={{ fontSize: 20 }}
            title="Ваши созданные планы:"
          />
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <MyOriginalPlans
        plans={userOriginalPlans}
        navigation={navigation}
        ListHeaderComponent={renderHeader}
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
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
    borderBottomColor: '#ccc',
  },
  noTasksText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#555',
  },
});
