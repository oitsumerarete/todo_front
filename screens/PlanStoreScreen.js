import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import OriginalTaskCard from './common/OriginalTaskCard';
import API_URL from '../config';

const { width } = Dimensions.get('window');

const PlanStoreScreen = ({ route }) => {
  const { planId } = route.params;
  const swiper = useRef();
  const [currentDay, setCurrentDay] = useState(1); // Tracks the selected day index (e.g., first day is 0)
  const [currentDayTasks, setCurrentDayTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [planTitle, setPlanTitle] = useState('');
  const [weekOffset, setWeekOffset] = useState(0); // Keeps track of how many weeks we've scrolled
  const [isUserHasOtherActivePlan, setIsUserHasOtherActivePlan] = useState(false); // Keeps track of how many weeks we've scrolled
  const [numberOfDaysForPlan, setNumberOfDaysForPlan] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false); // Состояние модального окна


  const changeDayTasks = (dayIndex) => {
    setCurrentDay(dayIndex + 1); // Индексация начинается с 0, но dayNumber с 1
    setCurrentDayTasks(tasks.filter((task) => task.dayNumber === dayIndex + 1));
  };


  const renderTaskItem = ({ item }) => <OriginalTaskCard task={item} />;

  // Calculate the days to display (7 days per swipe) based on weekOffset
  const days = useMemo(() => {
    let totalDaysCount = 0;

    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 })
        .map((_, index) => {
          const dayIndex = (weekOffset + adj) * 7 + index;
          if (dayIndex < 0 || dayIndex >= numberOfDaysForPlan) return null;
          return {
            label: `${dayIndex + 1} день`,
            dayIndex,
          };
        })
        .filter(day => day !== null);
    }).filter(weeks => weeks.length);
    
  }, [weekOffset, numberOfDaysForPlan]);

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  // Fetch plans from the API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/original/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlanTitle(response.data.title);
      setIsUserHasOtherActivePlan(response.data.isActivePlanExists)

      setTasks(response.data.tasks);
      const maxNumber = Math.max(...response.data.tasks.map(item => item.dayNumber));
      setNumberOfDaysForPlan(maxNumber);
      setCurrentDay(1);
      setCurrentDayTasks(response.data.tasks.filter(task => task.dayNumber === 1));

    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, [getBearerToken, planId]);

  const handleStartPlan = async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      await axios.post(`${API_URL}/original/plans/${planId}/start`,   {},
        {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsModalVisible(false);
    } catch (err) {
      console.log(err)
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };  
  const onStartButtonPress = () => {
    if (isUserHasOtherActivePlan) {
      setIsModalVisible(true); // Показать модальное окно, если у пользователя есть другой активный план
    } else {
      handleStartPlan(); // Запустить план, если нет другого активного плана
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{planTitle}</Text>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) return; // Оставляем текущий
              const direction = ind - 1; // -1 для влево, 1 для вправо
              setWeekOffset(prevOffset => prevOffset + direction);
              requestAnimationFrame(() => swiper.current.scrollTo(1, false)); // Более плавный переход
            }}>
            {days.map((daySet, index) => (
              <View style={styles.itemRow} key={index}>
                {daySet.map((item, dateIndex) => {
                  const isActive = currentDay === item.dayIndex + 1;
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => changeDayTasks(item.dayIndex)}>
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#111',
                            borderColor: '#111',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.label}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={styles.subtitle}>{currentDay} день</Text>
          <View style={styles.container}>
              <FlatList
                data={currentDayTasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.taskId.toString()}
              />
            </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onStartButtonPress}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Начать сейчас!</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Если вы начнете этот план, ваш текущий план завершится. Вы уверены?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleStartPlan} style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.modalButtonText}>Начать!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    paddingTop: 10,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
  /** Item */
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4,
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#76182a',
    borderColor: '#76182a',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 320,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#000',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#76182a',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default PlanStoreScreen;
