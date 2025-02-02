// screens/TaskCreationScreen.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Button } from 'react-native-paper';
import BottomSheet from '@gorhom/bottom-sheet';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import OriginalTaskCard from './OriginalTaskCard'; // Ваш компонент для отображения задачи
import API_URL from '../../config'; // Ваш API_URL

const { width } = Dimensions.get('window');

// Список доступных тегов для плана (для цвета и, если план не выбран, в качестве дефолтного набора)
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

// Маппинг: для каждого тега плана доступны определённые теги для задач
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

const TaskCreationScreen = ({ route, navigation }) => {
  // Получаем данные плана (в том числе выбранный тег плана) из параметров навигации
  const { plan } = route.params;

  // Локальные состояния для задач
  const [currentDay, setCurrentDay] = useState(0);
  const [days, setDays] = useState([[{ dayIndex: 0, label: '1' }]]);
  const [allTasksForPlan, setAllTasksForPlan] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dayNumber: 0,
    startTime: null,
    endTime: null,
    isMandatory: true,
    isMeal: false,
    image: null,
    tag: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showTimeTaskFields, setShowTimeTaskFields] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerField, setPickerField] = useState(null);
  const [isCreationButtonDisabled, setIsCreationButtonDisabled] = useState(true);

  const bottomSheetRef = useRef(null);
  const swiper = useRef();

  // Функция для получения токена
  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  // Вычисляем список тегов для задач на основе выбранного тега плана
  const taskTagsData = plan.tag
    ? planTagToTaskTags[plan.tag]?.map((tag) => ({
        label: tag,
        // Берём цвет выбранного тега плана из availableTags
        color: availableTags.find((t) => t.label === plan.tag)?.color || '#ddd',
      }))
    : availableTags;

  // Функция для переключения выбранного тега для задачи
  const handleTagToggle = (tagLabel) => {
    setNewTask((prevTask) => ({
      ...prevTask,
      tag: prevTask.tag === tagLabel ? '' : tagLabel,
    }));
  };

  // Переключение дней (упрощённый вариант)
  const changeDayTasks = (dayIndex) => {
    setCurrentDay(dayIndex);
  };

  // Удаление задачи
  const handleDeleteTask = (taskToDelete) => {
    setAllTasksForPlan((prevTasks) =>
      prevTasks.filter((task) => task !== taskToDelete)
    );
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItemContainer}>
      <OriginalTaskCard task={item} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTask(item)}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleTaskInputChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };
  const addDay = () => {
    const lastWeek = days[days.length - 1];
    const lastDayIndex = lastWeek[lastWeek.length - 1].dayIndex;
    if (lastWeek.length < 7) {
      const newDay = { dayIndex: lastDayIndex + 1, label: String(lastDayIndex + 2) };
      const updatedDays = [...days];
      updatedDays[updatedDays.length - 1] = [...lastWeek, newDay];
      setDays(updatedDays);
    } else {
      const newDay = { dayIndex: lastDayIndex + 1, label: String(lastDayIndex + 2) };
      setDays([...days, [newDay]]);
    }
  };

  const removeLastDay = () => {
    const lastWeek = days[days.length - 1];
    if (!lastWeek || (lastWeek.length === 0 && days.length === 1)) return;

    const updatedDays = [...days];
    if (lastWeek.length === 1) {
      updatedDays.pop();
    } else {
      updatedDays[updatedDays.length - 1] = lastWeek.slice(0, -1);
    }
    setDays(updatedDays);
  };

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
      setSelectedImage(result.assets[0].uri);
      handleTaskInputChange('image', result.assets[0].uri);
    }
  };

  const showDatePicker = (field) => {
    setPickerMode('time');
    setPickerField(field);
    setShowPicker(true);
  };

  const handlePickerChange = (event, selectedValue) => {
    if (event.type === 'set' && selectedValue) {
      setNewTask((prev) => ({
        ...prev,
        [pickerField]: selectedValue,
      }));
    }
    setShowPicker(false);
  };

  const handleCreateTask = () => {
    const taskToAdd = { ...newTask, dayNumber: currentDay };
    setAllTasksForPlan((prev) => [...prev, taskToAdd]);
    handleCloseBottomSheet();
    // Сброс формы задачи
    setNewTask({
      title: '',
      description: '',
      dayNumber: currentDay,
      startTime: null,
      endTime: null,
      isMandatory: true,
      isMeal: false,
      image: null,
      tag: '',
    });
    setSelectedImage(null);
  };

  // Отправка плана с задачами на сервер
  const handlePlanToServer = async () => {
    try {
      const formData = new FormData();
      // Добавляем данные плана
      formData.append('title', plan.title);
      formData.append('description', plan.description);
      formData.append('tag', plan.tag);
      if (plan.image) {
        const filename = plan.image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image';
        formData.append('image', {
          uri: plan.image,
          name: filename,
          type: fileType,
        });
      }
      // Добавляем задачи
      allTasksForPlan.forEach((task, index) => {
        formData.append(`tasks[${index}][title]`, task.title);
        formData.append(`tasks[${index}][description]`, task.description);
        formData.append(`tasks[${index}][dayNumber]`, task.dayNumber + 1);
        formData.append(`tasks[${index}][tag]`, task.tag);
        formData.append(`tasks[${index}][startTime]`, task.startTime?.toISOString() || null);
        formData.append(`tasks[${index}][endTime]`, task.endTime?.toISOString() || null);
        formData.append(`tasks[${index}][isMandatory]`, task.isMandatory);
        formData.append(`tasks[${index}][isMeal]`, task.isMeal);

        if (task.image) {
          const filename = task.image.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : 'image';
          formData.append(`tasks[${index}][image]`, {
            uri: task.image,
            name: filename,
            type: fileType,
          });
        }
      });

      const token = await getBearerToken();
      const response = await axios.post(`${API_URL}/original/plans`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        navigation.navigate('Страница плана', { planId: response.data });
      } else {
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  useEffect(() => {
    setIsCreationButtonDisabled(!newTask.title.trim());
  }, [newTask.title]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Swiper для выбора дней */}
        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) return;
              setTimeout(() => {
                const newIndex = ind - 1;
                setCurrentDay(currentDay + newIndex);
                swiper.current.scrollTo(1, false);
              }, 100);
            }}
          >
            {days.map((daySet, index) => (
              <View style={styles.itemRow} key={index}>
                {daySet.map((item, dateIndex) => {
                  const isActive = currentDay === item.dayIndex;
                  return (
                    <TouchableWithoutFeedback key={dateIndex} onPress={() => changeDayTasks(item.dayIndex)}>
                      <View style={[styles.item, isActive && styles.activeItem]}>
                        <Text style={[styles.itemWeekday, isActive && styles.activeItemText]}>
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

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button
            style={{ marginLeft: 16, borderWidth: 0.5, borderColor: 'grey' }}
            labelStyle={{ color: '#000' }}
            onPress={addDay}
          >
            Добавить день
          </Button>
          {days[0].length > 1 && (
            <Button
              style={{ marginLeft: 5, borderWidth: 0.5, borderColor: '#76182a' }}
              labelStyle={{ color: '#000' }}
              onPress={removeLastDay}
            >
              Удалить день
            </Button>
          )}
        </View>
        {/* Список задач для текущего дня */}
        <View style={styles.taskListContainer}>
          <Text style={styles.subtitle}>Задачи для дня {currentDay + 1}</Text>
          <Button style={styles.addTaskButton} mode="outlined" onPress={handleOpenBottomSheet}>
            Добавить задачу
          </Button>
          <FlatList
            data={allTasksForPlan.filter((task) => task.dayNumber === currentDay)}
            renderItem={renderTaskItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        

        {/* Кнопка для сохранения плана */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              allTasksForPlan.length === 0 && styles.disabledBtn, // применяем дополнительный стиль, если задач нет
            ]}
            disabled={allTasksForPlan.length === 0} // если задач нет, кнопка недоступна
            onPress={handlePlanToServer}
          >
            <Text style={styles.submitBtnText}>Сохранить план!</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BottomSheet для создания задачи */}
      <BottomSheet ref={bottomSheetRef} snapPoints={['96%']} index={-1}>
        <View style={styles.contentContainer}>
          <Text style={styles.header}>Создать задачу</Text>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Название задачи</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите название задачи"
              value={newTask.title}
              onChangeText={(text) => handleTaskInputChange('title', text)}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Введите описание задачи"
              multiline
              value={newTask.description}
              onChangeText={(text) => handleTaskInputChange('description', text)}
            />
          </View>

          {/* Секция выбора тегов для задачи (динамически формируется по тегу плана) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Теги задачи</Text>
            <FlatList
              data={taskTagsData}
              keyExtractor={(item) => item.label}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tag,
                    { backgroundColor: item.color },
                    newTask.tag === item.label && styles.selectedTag,
                  ]}
                  onPress={() => handleTagToggle(item.label)}
                >
                  <Text style={[styles.tagText, newTask.tag === item.label && styles.selectedTagText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.toggleContainer}>
            <Text>Указать время:</Text>
            <Button onPress={() => setShowTimeTaskFields(!showTimeTaskFields)}>
              {showTimeTaskFields ? 'Без времени' : 'С указанием времени'}
            </Button>
          </View>

          {showTimeTaskFields && (
            <View style={styles.timeContainer}>
              <TouchableOpacity onPress={() => showDatePicker('startTime')}>
                <Text style={styles.dateText}>
                  {newTask.startTime
                    ? newTask.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Время начала'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showDatePicker('endTime')}>
                <Text style={styles.dateText}>
                  {newTask.endTime
                    ? newTask.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Время окончания'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.fieldContainer}>
            <TouchableOpacity style={styles.btn} onPress={handleSelectImage}>
              <Text style={styles.btnText}>Выбрать изображение</Text>
            </TouchableOpacity>
            {selectedImage && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={styles.label}>Предпросмотр:</Text>
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: 100, height: 100, borderRadius: 8 }}
                />
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <TouchableOpacity
              style={[styles.btn, isCreationButtonDisabled && styles.btnDisabled]}
              disabled={isCreationButtonDisabled}
              onPress={handleCreateTask}
            >
              <Text style={styles.btnText}>Создать задачу</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

      {/* DateTimePicker */}
      {showPicker && (
        <DateTimePicker
          value={newTask[pickerField] instanceof Date ? newTask[pickerField] : new Date()}
          mode={pickerMode}
          is24Hour
          display="spinner"
          onChange={handlePickerChange}
          style={{ width: '100%' }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 15 },
  picker: { flex: 1, maxHeight: 64, flexDirection: 'row', alignItems: 'center' },
  itemRow: { width: width, flexDirection: 'row', paddingHorizontal: 12 },
  item: {
    minWidth: width / 8.7,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeItem: { backgroundColor: '#76182a', borderColor: '#76182a' },
  itemWeekday: { fontSize: 13, color: '#737373' },
  activeItemText: { color: '#fff' },
  taskListContainer: { flex: 1, padding: 16 },
  subtitle: { fontSize: 17, fontWeight: '600', color: '#999', marginBottom: 12 },
  addTaskButton: { marginBottom: 15, borderColor: '#76182a' },
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingRight: 42,
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: '#b00000',
    paddingVertical: 10,
    marginLeft: 12,
    paddingHorizontal: 9,
    borderRadius: 4,
  },
  deleteButtonText: { color: '#fff', fontWeight: '600' },
  footer: { marginTop: 'auto', paddingHorizontal: 16, marginBottom: 16 },
  submitBtn: {
    backgroundColor: '#76182a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 18 },
  contentContainer: { padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#76182a',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    minWidth: (width - 64) / 2,
  },
  btn: { backgroundColor: '#76182a', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16 },
  btnDisabled: { backgroundColor: '#B0BEC5' },
  imagePreview: { width: 100, height: 100, marginTop: 8, borderRadius: 8 },
  tag: {
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  selectedTag: { borderWidth: 2, borderColor: '#76182a' },
  tagText: { color: '#666', fontWeight: '600' },
  selectedTagText: { color: '#76182a', fontWeight: 'bold' },
});

export default TaskCreationScreen;
