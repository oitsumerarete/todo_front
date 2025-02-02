// PlanScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Button,
  Switch,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import TaskItem from './TaskItem';
import API_URL from '../../config';
import * as ImagePicker from 'expo-image-picker';
// Импортируем хук для навигации
import { useNavigation } from '@react-navigation/native';

// Определяем набор доступных тегов для плана и соответствующий маппинг для задач
const availableTags = [
  { label: 'Фитнес', color: '#FFE4E6' },
  { label: 'Питание', color: '#FFF5E6' },
  { label: 'Работа', color: '#FFFFE6' },
  { label: 'Отдых', color: '#E6FFEB' },
  { label: 'Путешествия', color: '#E6F7FF' },
  { label: 'Саморазвитие', color: '#F3E6FF' },
  { label: 'Семья', color: '#FFEDED' },
  { label: 'Быт', color: '#E8FFE8' },
  { label: 'Здоровье', color: '#E8F3FF' },
  { label: 'Социальная активность', color: '#FBE8FF' },
];

const planTagToTaskTags = {
  'Фитнес': [
    'Кардио',
    'Силовая тренировка',
    'Растяжка',
    'Йога',
    'Разминка',
    'Остывание',
    'Функциональный тренинг',
    'Прогулка',
    'Плавание',
    'Бег',
    'Велотренировка',
  ],
  'Питание': [
    'Завтрак',
    'Обед',
    'Ужин',
    'Перекус',
    'Подсчет калорий',
    'Приём витаминов',
    'Планирование меню',
    'Готовка',
    'Вода (норма)',
    'Детокс',
  ],
  'Работа': [
    'Совещание',
    'Звонки',
    'Ответы на письма',
    'Кодинг',
    'Дизайн',
    'Написание статей',
    'Подготовка презентации',
    'Брейншторминг',
    'Анализ данных',
    'Административные задачи',
  ],
  'Отдых': [
    'Медитация',
    'Сон',
    'Короткий сон (power nap)',
    'Чтение книги',
    'Прогулка',
    'Музыка',
    'Наблюдение за природой',
    'Творчество (рисование, письмо)',
    'Спа-процедуры',
    'Дыхательные упражнения',
  ],
  'Путешествия': [
    'Бронирование отеля',
    'Покупка билетов',
    'Сбор чемодана',
    'Исследование достопримечательностей',
    'Фотосессия',
    'Посещение кафе',
    'Маршрут дня',
    'Транспортные пересадки',
    'Покупка сувениров',
    'Экскурсия',
  ],
  'Саморазвитие': [
    'Чтение книги',
    'Изучение языка',
    'Онлайн-курс',
    'Практика ораторского искусства',
    'Ведение дневника',
    'Планирование недели',
    'Разбор полетов (рефлексия)',
    'Просмотр лекции',
    'Изучение нового навыка',
    'Написание заметок',
  ],
  'Семья': [
    'Завтрак с семьей',
    'Время с детьми',
    'Созвон с родителями',
    'Совместный ужин',
    'Семейная прогулка',
    'Настольные игры',
    'Планирование семейных мероприятий',
    'Фотосессия',
    'Разговор по душам',
    'Совместная уборка',
  ],
  'Быт': [
    'Уборка',
    'Готовка',
    'Покупка продуктов',
    'Оплата счетов',
    'Организация пространства',
    'Стирка',
    'Ремонт',
    'Полив растений',
    'Планирование покупок',
    'Перестановка мебели',
  ],
  'Здоровье': [
    'Визит к врачу',
    'Принятие витаминов',
    'Упражнения для спины',
    'Медитация',
    'Отказ от вредных привычек',
    'Сон 7-8 часов',
    'Лечебная физкультура',
    'Питьевой режим',
    'Дневник самочувствия',
    'Контроль веса',
  ],
  'Социальная активность': [
    'Встреча с друзьями',
    'Посещение мероприятия',
    'Волонтерство',
    'Созвон с другом',
    'Социальные сети',
    'Новый контакт',
    'Участие в митинге',
    'Помощь близким',
    'Нетворкинг',
    'Обсуждение идей',
  ],
};

const PlanScreen = () => {
  const navigation = useNavigation(); // используем навигацию

  useFocusEffect(
    useCallback(() => {
      // Действие при каждом открытии экрана
      fetchPlan();
    }, [])
  );
  // Хелпер для получения даты в формате YYYY-MM-DD
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы начинаются с 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getFormattedDate(new Date());

  // Основные состояния
  const [isLoading, setIsLoading] = useState(false);
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [plan, setPlan] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerField, setPickerField] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showTimeTaskFields, setShowTimeTaskFields] = useState(false);

  // Состояние новой задачи расширено: добавлены поля image и tag
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: todayDate,
    startTime: new Date(),
    endTime: new Date(),
    isMandatory: false,
    isMeal: false,
    image: null,
    tag: '',
  });

  const [taskSummaryByDate, setTaskSummaryByDate] = useState({});
  const [today, setToday] = useState(todayDate);
  const [isMealToday, setIsMealToday] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);
  const [isTodayDayCompleted, setIsTodayDayCompleted] = useState(false);
  const [isCreationButtonDisabled, setIsCreationButtonDisabled] = useState(true);
  const [originalPlanId, setOriginalPlanId] = useState(null);
  const [mealsStatDone, setMealsStatDone] = useState({
    fats: 0,
    carbs: 0,
    proteins: 0,
    kcal: 0,
  });
  const [mealsStatAll, setMealsStatAll] = useState({
    fats: 0,
    carbs: 0,
    proteins: 0,
    kcal: 0,
  });

  const bottomSheetRef = useRef(null);

  // Функция загрузки плана пользователя
  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${API_URL}/plans/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { planId, title, description, originalPlanId, isDayCompleted, tag } = response.data;
      const tasks = response.data?.tasks || [];

      const tasksByDateTemp = {};
      const markedDatesTemp = {};
      const taskSummaryByDateTemp = {};

      tasks.forEach((task) => {
        const dateObj = new Date(task.date);
        const date = getFormattedDate(dateObj);
        if (!tasksByDateTemp[date]) {
          tasksByDateTemp[date] = [];
        }
        tasksByDateTemp[date].push(task);
        markedDatesTemp[date] = { marked: true };

        if (!taskSummaryByDateTemp[date]) {
          taskSummaryByDateTemp[date] = {
            mandatoryNotDone: 0,
            totalTasks: 0,
          };
        }
        taskSummaryByDateTemp[date].totalTasks++;
        if (task.isMandatory && task.status !== 'done') {
          taskSummaryByDateTemp[date].mandatoryNotDone++;
        }
      });

      setPlan({ planId, title, description, tag });
      setOriginalPlanId(originalPlanId);
      setIsTodayDayCompleted(isDayCompleted);
      setTasksByDate(tasksByDateTemp);
      setMarkedDates(markedDatesTemp);
      setTaskSummaryByDate(taskSummaryByDateTemp);

      // Если для сегодняшней даты уже есть задачи, выбираем её, иначе выбираем текущую дату
      setSelectedDate(tasksByDateTemp[todayDate] ? todayDate : todayDate);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  // Обновление текущей даты каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(getFormattedDate(new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  // Функция показа DateTimePicker для выбора даты или времени
  const showDatePicker = (field) => {
    if (field === 'date') {
      setPickerMode('date');
    } else {
      setPickerMode('time');
    }
    setPickerField(field);
    setShowPicker(true);
  };

  useEffect(() => {
    setIsCreationButtonDisabled(!newTask.title.trim());
  }, [newTask.title]);

  const handlePickerChange = (event, selectedValue) => {
    if (event.type === 'set' && selectedValue) {
      if (pickerMode === 'date') {
        const updatedValue = getFormattedDate(selectedValue);
        setNewTask((prev) => ({
          ...prev,
          [pickerField]: updatedValue,
        }));
      } else {
        setNewTask((prev) => ({
          ...prev,
          [pickerField]: selectedValue,
        }));
      }
    }
    setShowPicker(false);
  };

  // Функция выбора изображения через галерею (Expo ImagePicker)
  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Необходимо разрешение для доступа к галерее!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setNewTask((prev) => ({ ...prev, image: uri }));
    }
  };

  // Функция переключения выбранного тега для задачи
  const handleTagToggle = (tagLabel) => {
    setNewTask((prev) => ({
      ...prev,
      tag: prev.tag === tagLabel ? '' : tagLabel,
    }));
  };

  // Функция создания задачи (отправка данных на сервер)
  const handleCreateTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      // Создаём объект FormData для отправки данных задачи
      const formData = new FormData();
  
      // Добавляем данные задачи
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('planId', plan.planId);
      formData.append('date', newTask.date);
      formData.append('tag', newTask.tag);
  
      // Приводим время к строке в формате ISO, если это объект Date
      formData.append(
        'startTime',
        newTask.startTime instanceof Date
          ? newTask.startTime.toISOString()
          : newTask.startTime
      );
      formData.append(
        'endTime',
        newTask.endTime instanceof Date
          ? newTask.endTime.toISOString()
          : newTask.endTime
      );
  
      formData.append('isMandatory', newTask.isMandatory);
      formData.append('isMeal', newTask.isMeal);
  
      // Если имеется изображение, добавляем его в formData
      if (newTask.image) {
        const filename = newTask.image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image';
        formData.append('image', {
          uri: newTask.image,
          name: filename,
          type: fileType,
        });
      }
  
      // Отправляем запрос на создание задачи с заголовками для multipart/form-data
      const response = await axios.post(
        `${API_URL}/plans/${plan.planId}/tasks`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const createdTask = response.data;
      const dateKey = newTask.date;
  
      // Обновляем состояние задач и меток на календаре
      setTasksByDate((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey] ? [...prev[dateKey], createdTask] : [createdTask],
      }));
  
      setMarkedDates((prev) => ({
        ...prev,
        [dateKey]: { marked: true },
      }));
  
      setTaskSummaryByDate((prev) => {
        const isMandatoryNotDone =
          createdTask.isMandatory && createdTask.status !== 'done' ? 1 : 0;
        return {
          ...prev,
          [dateKey]: {
            totalTasks: (prev[dateKey]?.totalTasks || 0) + 1,
            mandatoryNotDone: (prev[dateKey]?.mandatoryNotDone || 0) + isMandatoryNotDone,
          },
        };
      });
  
      // Закрываем нижний лист и сбрасываем форму создания задачи
      bottomSheetRef.current?.close();
      setNewTask({
        title: '',
        description: '',
        date: todayDate,
        startTime: new Date(),
        endTime: new Date(),
        isMandatory: false,
        isMeal: false,
        image: null,
        tag: '',
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  

  // Функция изменения статуса задачи
  const onStatusChange = async (taskId, isMandatory, newStatus, taskDate) => {
    let flag = false;
    // Обновляем сводную статистику по задачам для указанной даты
    setTaskSummaryByDate((prevSummary) => {
      const updatedSummary = { ...prevSummary };
      if (!updatedSummary[taskDate]) {
        updatedSummary[taskDate] = { mandatoryNotDone: 0, totalTasks: 0 };
      }
      if (isMandatory) {
        if (newStatus === 'done') {
          // Если после изменения останется 0 обязательных невыполненных задач, показываем модальное окно
          if (updatedSummary[taskDate].mandatoryNotDone - 1 === 0) {
            setModalVisible(true);
            setPendingTask({ taskId, date: taskDate, newStatus, isLastTaskForDayToDoGoingToBeDone: true });
            flag = true;
            return prevSummary;
          }
          updatedSummary[taskDate].mandatoryNotDone -= 1;
        } else {
          updatedSummary[taskDate].mandatoryNotDone += 1;
        }
      }
      return updatedSummary;
    });

    if (flag) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      await axios.put(
        `${API_URL}/plans/tasks/${taskId}`,
        { status: newStatus, planId: plan.planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      return;
    }

    // Обновляем локальное состояние списка задач для указанной даты
    setTasksByDate((prevTasks) => {
      const updatedTasks = {
        ...prevTasks,
        [taskDate]: prevTasks[taskDate].map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        ),
      };
      return updatedTasks;
    });
  };

  // Функции для drag & drop списка задач
  const renderItem = ({ item, index, drag, isActive }) => {
    const itemDateLocal = new Date(item.date).toLocaleDateString('en-CA');
    return (
      <TaskItem
        item={item}
        drag={drag}
        isActive={isActive}
        isTodayDayComleted={isTodayDayCompleted}
        isToday={itemDateLocal === todayDate}
        isChecked={item.status === 'done'}
        onStatusChange={(taskId, isMandatory, newStatus) =>
          onStatusChange(taskId, isMandatory, newStatus, itemDateLocal)
        }
      />
    );
  };

  // Обработчик окончания перетаскивания списка
  const onDragEnd = ({ data }) => {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedDate]: data,
    }));
  };

  // Расчет статистики для задач-приемов пищи
  const tasksForSelectedDate = tasksByDate[selectedDate] || [];
  useEffect(() => {
    let kcal = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;

    tasksForSelectedDate
      .filter((task) => task.status === 'done' && task.isMeal)
      .forEach((task) => {
        if (task.calories && task.protein && task.fats && task.carbs) {
          kcal += task.calories;
          proteins += task.protein;
          fats += task.fats;
          carbs += task.carbs;
          setIsMealToday(true);
        }
      });

    setMealsStatDone({ kcal, proteins, fats, carbs });

    kcal = 0;
    proteins = 0;
    fats = 0;
    carbs = 0;

    tasksForSelectedDate.forEach((task) => {
      if (task.calories && task.protein && task.fats && task.carbs && task.isMeal) {
        kcal += task.calories;
        proteins += task.protein;
        fats += task.fats;
        carbs += task.carbs;
      }

      setIsMealToday(true);
    });

    setMealsStatAll({ kcal, proteins, fats, carbs });
  }, [tasksByDate[selectedDate]]);

  // Объединяем данные для выделения дат на календаре
  const mergedMarkedDates = { ...markedDates };
  Object.entries(taskSummaryByDate).forEach(([date, summary]) => {
    mergedMarkedDates[date] = {
      ...mergedMarkedDates[date],
      dotColor: summary.mandatoryNotDone > 0 ? 'gray' : 'gray',
    };
  });
  if (selectedDate) {
    mergedMarkedDates[selectedDate] = {
      ...(mergedMarkedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#76182a',
    };
  }

  // Формируем список тегов для задач на основании тега плана (если он задан)
  const taskTagsData = plan && plan.tag
    ? (planTagToTaskTags[plan.tag] || []).map((tag) => ({
        label: tag,
        color: (availableTags.find((t) => t.label === plan.tag) || {}).color || '#ddd',
      }))
    : availableTags;

  // Функции для модального окна (подтверждение завершения дня)
  const confirmDayCompletion = async () => {
    if (!pendingTask) return; // Проверяем, есть ли задача для подтверждения
  
    const { taskId, date, newStatus, isLastTaskForDayToDoGoingToBeDone } = pendingTask;
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      await axios.put(
        `${API_URL}/plans/tasks/${taskId}`,
        { status: newStatus, planId: plan.planId, lastTaskGoingToBeDone: isLastTaskForDayToDoGoingToBeDone, originalPlanId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasksByDate((prevTasks) => {
        const updatedTasks = {
          ...prevTasks,
          [date]: prevTasks[date].map((task) =>
            task.taskId === taskId ? { ...task, status: newStatus } : task
          ),
        };
        return updatedTasks;
      });

      setTaskSummaryByDate((prevSummary) => {
        const updatedSummary = { ...prevSummary };
    
        if (!updatedSummary[date]) {
          updatedSummary[date] = { mandatoryNotDone: 0, totalTasks: 0 }; // Инициализация объекта, если его нет
        }
  
        if (newStatus === 'done') {
          updatedSummary[date].mandatoryNotDone -= 1;
        }
  
        return updatedSummary;
      });

      setIsTodayDayCompleted(true);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  
    // Скрываем модалку и очищаем состояние
    setModalVisible(false);
    setPendingTask(null);
  };

  const cancelDayCompletion = () => {
    setModalVisible(false);
    setPendingTask(null);
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#76182a" />
        </View>
      </SafeAreaView>
    );
  }

  // Если активный план отсутствует, отображаем сообщение с кнопкой перехода на страницу "Поиск"
  if (!plan || !plan.planId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noPlanContainer}>
          <Text style={styles.noPlanText}>
            У вас сейчас нет активного плана, начните новый
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Поиск планов')}
          >
            <Text style={styles.searchButtonText}>К новым планам!</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Основной рендер, если план существует
  return (
    <SafeAreaView style={styles.container}>
      {/* Описание плана */}
      <View style={styles.planDescriptionContainer}>
        <View style={styles.planDescription}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDetails}>{plan.description}</Text>
        </View>
        <View style={[styles.circle, styles.row]}>
          <MaterialIcons name="error-outline" size={25} color="#76182a" style={styles.mandatoryIcon} />
          <Text style={styles.text}>{taskSummaryByDate[selectedDate]?.mandatoryNotDone || 0}</Text>
        </View>
      </View>

      {/* Календарь */}
      <Calendar
        current={selectedDate || todayDate}
        onDayPress={handleDayPress}
        markedDates={mergedMarkedDates}
        theme={{
          selectedDayBackgroundColor: '#76182a',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
        }}
      />

      {isLoading && (!tasksForSelectedDate || tasksForSelectedDate.length === 0) && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#76182a" />
        </View>
      )}

      {/* Список задач для выбранной даты */}
      {selectedDate && (
        <View style={styles.taskListContainer}>
          {isMealToday && mealsStatAll.kcal ? (
            <View style={styles.planStatsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {mealsStatDone.proteins || 0} / {mealsStatAll.proteins || 0}
                </Text>
                <Text style={[styles.statLabel, { color: '#5CB85C' }]}>Белки</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {mealsStatDone.fats || 0} / {mealsStatAll.fats || 0}
                </Text>
                <Text style={[styles.statLabel, { color: '#F0AD4E' }]}>Жиры</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {mealsStatDone.carbs || 0} / {mealsStatAll.carbs || 0}
                </Text>
                <Text style={[styles.statLabel, { color: '#5BC0DE' }]}>Углеводы</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {mealsStatDone.kcal || 0} / {mealsStatAll.kcal || 0}
                </Text>
                <Text style={[styles.statLabel, { color: '#D9534F' }]}>Ккал</Text>
              </View>
            </View>
          ) : null}

          {tasksForSelectedDate && (
            <DraggableFlatList
              data={tasksForSelectedDate}
              renderItem={renderItem}
              keyExtractor={(item) => item.taskId.toString()}
              onDragEnd={onDragEnd}
              contentContainerStyle={{ paddingBottom: 70 }}
            />
          )}
        </View>
      )}

      {/* FAB для открытия нижнего листа */}
      <FAB
        style={styles.fab}
        icon={() => <Icon name="plus" size={24} color="white" />}
        onPress={handleOpenBottomSheet}
      />

      {/* Нижний лист для создания задачи */}
      <BottomSheet
  ref={bottomSheetRef}
  snapPoints={['70%', '100%']}  // устанавливаем два snap point для гибкости
  index={-1}
>
  <ScrollView contentContainerStyle={styles.bottomSheetContainer}>
    <Text style={styles.bottomSheetHeader}>Создать задачу</Text>

    {/* Название задачи */}
    <View style={styles.bottomSheetField}>
      <Text style={styles.label}>Название задачи</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите название задачи"
        value={newTask.title}
        onChangeText={(text) => setNewTask((prev) => ({ ...prev, title: text }))}
      />
    </View>

    {/* Описание */}
    <View style={styles.bottomSheetField}>
      <Text style={styles.label}>Описание</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Введите описание задачи"
        multiline
        value={newTask.description}
        onChangeText={(text) => setNewTask((prev) => ({ ...prev, description: text }))}
      />
    </View>

    {/* Секция выбора тегов */}
    <View style={styles.bottomSheetField}>
      <Text style={styles.label}>Теги задачи</Text>
      <FlatList
        data={taskTagsData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tag,
              { backgroundColor: item.color },
              newTask.tag === item.label && styles.selectedTag,
            ]}
            onPress={() => handleTagToggle(item.label)}
          >
            <Text
              style={[
                styles.tagText,
                newTask.tag === item.label && styles.selectedTagText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>

    {/* Переключатель показа времени */}
    <View style={[styles.bottomSheetField, styles.toggleContainer]}>
      <Text style={styles.label}>Указать время:</Text>
      <Switch
        thumbColor={showTimeTaskFields ? 'white' : 'gray'}
        trackColor={{ false: '#76182a', true: '#76182a' }}
        style={{ transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }] }}
        value={showTimeTaskFields}
        onValueChange={setShowTimeTaskFields}
      />
    </View>

    {/* Время (если включено) */}
    {showTimeTaskFields && (
      <View style={styles.bottomSheetTimeContainer}>
        <View style={styles.bottomSheetTimeField}>
          <Text style={styles.label}>Начало</Text>
          <TouchableOpacity onPress={() => showDatePicker('startTime')}>
            <Text style={styles.dateText}>
              {newTask.startTime
                ? newTask.startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Выберите время'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSheetTimeField}>
          <Text style={styles.label}>Конец</Text>
          <TouchableOpacity onPress={() => showDatePicker('endTime')}>
            <Text style={styles.dateText}>
              {newTask.endTime
                ? newTask.endTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Выберите время'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )}

    {/* Приём пищи */}
    <View style={[styles.bottomSheetField, styles.switchContainer]}>
      <Text style={styles.label}>Прием пищи</Text>
      <Switch
        value={newTask.isMeal}
        onValueChange={(value) => setNewTask((prev) => ({ ...prev, isMeal: value }))}
      />
    </View>
    {newTask.isMeal && (
      <Text style={{fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        paddingVertical: 6,
        marginBottom: 10,
        color: '#ff6347',}}>
        Для корректного подсчета калорий добавьте описание блюда
      </Text>
    )}

    {/* Выбор изображения */}
    <View style={styles.bottomSheetField}>
      <TouchableOpacity style={styles.btn} onPress={handleSelectImage}>
        <Text style={styles.btnText}>Выбрать изображение</Text>
      </TouchableOpacity>
      {newTask.image && (
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={styles.label}>Предпросмотр:</Text>
          <Image
            source={{ uri: newTask.image }}
            style={{ width: 100, height: 100, borderRadius: 8 }}
          />
        </View>
      )}
    </View>

    {/* Кнопка создания задачи */}
    <View style={styles.bottomSheetField}>
      <TouchableOpacity
        style={[styles.btn, isCreationButtonDisabled && styles.btnDisabled]}
        disabled={isCreationButtonDisabled}
        onPress={handleCreateTask}
      >
        <Text style={styles.btnText}>Создать задачу</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</BottomSheet>

      {/* Модальное окно для подтверждения завершения дня */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Поздравляем! Вы завершили все обязательные задачи дня.{"\n"}Завершить день?
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Да, завершить день" onPress={confirmDayCompletion} />
              <Button title="Нет, отменить" onPress={cancelDayCompletion} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker для выбора даты/времени */}
      {showPicker && (
        <DateTimePicker
          value={
            pickerField === 'date'
              ? new Date(newTask.date)
              : newTask[pickerField] instanceof Date
              ? newTask[pickerField]
              : new Date()
          }
          mode={pickerMode}
          is24Hour
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </SafeAreaView>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  planDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  planDescription: { flex: 1 },
  planTitle: { fontSize: 20, fontWeight: 'bold' },
  planDetails: { fontSize: 16, color: 'gray' },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { marginLeft: 5, fontSize: 20, color: '#000' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  taskListContainer: { flex: 1, padding: 12 },
  planStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statBox: { alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  statLabel: { marginTop: 3, fontSize: 14, color: '#555' },
  divider: { width: 2, backgroundColor: '#eee', marginHorizontal: 8, height: '70%', alignSelf: 'center' },
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#76182a' },
  contentContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateText: { fontSize: 16, color: '#007bff', paddingVertical: 8 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  timeField: { flex: 1, marginRight: 8 },
  btn: {
    backgroundColor: '#76182a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#B0BEC5' },

  btnText: { color: '#fff', fontSize: 16 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bottomSheetContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  bottomSheetHeader: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  bottomSheetField: {
    marginBottom: 12,
  },
  tag: { padding: 10, marginRight: 8, borderWidth: 1, borderRadius: 8, borderColor: '#ddd' },
  selectedTag: { borderWidth: 2, borderColor: '#76182a' },
  tagText: { color: '#666', fontWeight: '600' },
  selectedTagText: { color: '#76182a', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  // Стили для экрана без активного плана
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPlanText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#76182a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
