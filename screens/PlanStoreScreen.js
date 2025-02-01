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
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import OriginalTaskCard from './common/OriginalTaskCard';
import API_URL from '../config';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PlanStoreScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const swiper = useRef();

  const [currentDay, setCurrentDay] = useState(1);
  const [currentDayTasks, setCurrentDayTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  const [planTitle, setPlanTitle] = useState('');
  const [planLikesCount, setPlanLikesCount] = useState(0);
  const [planImage, setPlanImage] = useState('');
  const [planDescription, setPlanDescription] = useState('');

  const [weekOffset, setWeekOffset] = useState(0);
  const [isUserHasOtherActivePlan, setIsUserHasOtherActivePlan] = useState(false);
  const [numberOfDaysForPlan, setNumberOfDaysForPlan] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);

  // Модалка задачи
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const changeDayTasks = (dayIndex) => {
    setCurrentDay(dayIndex + 1);
    setCurrentDayTasks(tasks.filter((task) => task.dayNumber === dayIndex + 1));
  };

  // Обработчик нажатия по задаче
  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleTaskPress(item)}>
      <OriginalTaskCard task={item} />
    </TouchableOpacity>
  );

  // Подготовка массива дней для Swiper (по неделям)
  const days = useMemo(() => {
    return [-1, 0, 1]
      .map((adj) => {
        return Array.from({ length: 7 }).map((_, index) => {
          const dayIndex = (weekOffset + adj) * 7 + index;
          if (dayIndex < 0 || dayIndex >= numberOfDaysForPlan) return null;
          return {
            label: `${dayIndex + 1}`,
            dayIndex,
          };
        }).filter(day => day !== null);
      })
      .filter(weeks => weeks.length);
  }, [weekOffset, numberOfDaysForPlan]);

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  // Получаем задачи и данные о плане
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/original/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlanTitle(response.data.title || '');
      setPlanLikesCount(response.data.likesCount || 0);
      setPlanImage(response.data.mainImageLink || '');
      setPlanDescription(response.data.description || '');
      setIsUserHasOtherActivePlan(response.data.isActivePlanExists);

      setTasks(response.data.tasks || []);
      const maxNumber = Math.max(
        ...response.data.tasks.map((item) => item.dayNumber),
        0
      );
      setNumberOfDaysForPlan(maxNumber);
      // По умолчанию показываем первый день
      setCurrentDay(1);
      setCurrentDayTasks(response.data.tasks.filter((task) => task.dayNumber === 1));
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
      await axios.post(`${API_URL}/original/plans/${planId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsModalVisible(false);
      // Возможно, стоит обновить какие-то данные или уйти на другой экран
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      navigation.navigate('Мой план')
      setLoading(false);
    }
  };

  const onStartButtonPress = () => {
    if (isUserHasOtherActivePlan) {
      setIsModalVisible(true);
    } else {
      handleStartPlan();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Блок с шапкой: картинка, название, описание */}
        <View style={styles.planHeader}>
          {!!planImage && (
            <Image
              source={{ uri: planImage }}
              style={styles.planImage}
            />
          )}
          <Text style={styles.planTitle}>{planTitle}</Text>
          {!!planDescription && (
            <Text style={styles.planDescription}>{planDescription}</Text>
          )}
          <View style={styles.likesContainer}>
            <Icon name="heart" size={25} color="#76182a" />
            <Text style={{fontSize: 21}}>{planLikesCount}</Text>
          </View>
        </View>

        {/* Блок со Swiper (выбор дней) */}
        {numberOfDaysForPlan > 0 && (
          <View style={styles.picker}>
            <Swiper
              index={1}
              ref={swiper}
              loop={false}
              showsPagination={false}
              onIndexChanged={(ind) => {
                if (ind === 1) return;
                const direction = ind - 1; // -1 влево, +1 вправо
                setWeekOffset((prevOffset) => prevOffset + direction);
                // Возвращаем слайдер в середину
                requestAnimationFrame(() => swiper.current.scrollTo(1, false));
              }}
            >
              {days.map((daySet, index) => (
                <View style={styles.itemRow} key={index}>
                  {daySet.map((item, dateIndex) => {
                    const isActive = currentDay === item.dayIndex + 1;
                    return (
                      <TouchableWithoutFeedback
                        key={dateIndex}
                        onPress={() => changeDayTasks(item.dayIndex)}
                      >
                        <View
                          style={[
                            styles.item,
                            isActive && {
                              backgroundColor: '#111',
                              borderColor: '#111',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.itemWeekday,
                              isActive && { color: '#fff' },
                            ]}
                          >
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
        )}

        {/* Список задач за выбранный день */}
        <View style={styles.taskList}>
          <Text style={styles.subtitle}>{currentDay} день</Text>
          <FlatList
            data={currentDayTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.taskId.toString()}
            scrollEnabled={false} // потому что мы уже в ScrollView
          />
        </View>
      </ScrollView>

      {/* Кнопка "Начать сейчас" внизу экрана */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onStartButtonPress} disabled={loading}>
          <View style={styles.btn}>
            <Text style={styles.btnText}>Начать сейчас!</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Модальное окно подтверждения запуска плана */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Если вы начнете этот план, ваш текущий план завершится. Вы уверены?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStartPlan}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.modalButtonText}>Начать!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно с детальной информацией задачи */}
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Если у задачи есть картинка, показываем */}
            {!!selectedTask?.mainImageLink && (
              <Image
                source={{ uri: selectedTask.mainImageLink }}
                style={styles.modalImage}
              />
            )}
            <Text style={styles.modalTitle}>
              {selectedTask?.title || 'Задача'}
            </Text>
            <Text style={styles.modalDescription}>
              {selectedTask?.description || 'Подробное описание...'}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setTaskModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PlanStoreScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  planHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  planImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1d',
    textAlign: 'center',
    marginBottom: 10,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  picker: {
    height: 74,
    paddingVertical: 12,
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
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
  itemWeekday: {
    fontSize: 16,
    fontWeight: '500',
    color: '#737373',
    paddingTop: 7,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
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

  // Модалки
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: '#000',
    borderColor: '#000',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#76182a',
    borderColor: '#76182a',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
