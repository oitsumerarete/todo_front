import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  FlatList,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import axios from 'axios';
import BottomSheet from '@gorhom/bottom-sheet';
import Swiper from 'react-native-swiper';
import OriginalTaskCard from './OriginalTaskCard';
import API_URL from '../../config';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

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

const PlanCreationScreen = ({navigation}) => {
  const swiper = useRef();
  const bottomSheetRef = useRef(null);
  const [isPlanCreationButtonDisabled, setIsPlanCreationButtonDisabled] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [currentDayTasks, setCurrentDayTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCreationButtonDisabled, setIsCreationButtonDisabled] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [days, setDays] = useState([[{"dayIndex": 0, "label": "1"}]]);
  const [allTasksForPlan, setAllTasksForPlan] = useState([]); // Все задачи плана
  const [showTimeTaskFields, setShowTimeTaskFields] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerField, setPickerField] = useState(null);

  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    tags: [],
    tasks: [],
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dayNumber: '',
    startTime: null,
    endTime: null,
    isMandatory: false,
    isMeal: false,
    image: null,
    tag: ''
  });

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  const changeDayTasks = (dayIndex) => {
    setCurrentDay(dayIndex);
    setCurrentDayTasks(tasks.filter((task) => task.dayNumber === dayIndex + 1));
  };

  // <<<<< ФУНКЦИЯ УДАЛЕНИЯ ЗАДАЧИ
  const handleDeleteTask = (taskToDelete) => {
    setAllTasksForPlan((prevTasks) =>
      prevTasks.filter((task) => task !== taskToDelete)
    );
  };
  // <<<<<

  // Изменим renderTaskItem, чтобы добавить кнопку удаления
  const renderTaskItem = ({ item }) => {
    return (
      <View style={styles.taskItemContainer}>
        <OriginalTaskCard task={item} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item)} // <<<<<
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const addDay = () => {
    const lastWeek = days[days.length - 1];
    const lastDayIndex = lastWeek[lastWeek.length - 1].dayIndex;
    if (lastWeek.length < 7) {
      const newDay = { dayIndex: lastDayIndex + 1, label: lastDayIndex + 2 };
      const updatedDays = [...days];
      updatedDays[updatedDays.length - 1] = [...lastWeek, newDay];
      setDays(updatedDays);
    } else {
      const newDay = { dayIndex: lastDayIndex + 1, label: lastDayIndex + 2 };
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

  const handleCreateTask = async () => {
    try {
      if (!showTimeTaskFields) {
        delete newTask.startTime;
        delete newTask.endTime;
      }
      setAllTasksForPlan((prevItems) => [...prevItems, newTask]);
      handleCloseBottomSheet();
      setNewTask({
        title: '',
        description: '',
        dayNumber: '',
        startTime: new Date(),
        endTime: new Date(),
        isMandatory: false,
        isMeal: false,
        image: null,
        tag: ''
      });
      setSelectedImage(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handlePlanToServer = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newPlan.title);
      formData.append('description', newPlan.description);
      formData.append('tags', JSON.stringify(newPlan.tags));

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
          Authorization: `Bearer ${token}`
        },
      });
      
      if (response.data) {
        navigation.navigate('PlanStoreScreen', { planId: response.data })
      } else {
        navigation.navigate('HomeScreen')
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const showDatePicker = (field) => {
    setPickerMode(field === 'date' ? 'date' : 'time');
    setPickerField(field);
    setShowPicker(true);
  };

  const handleTaskInputChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlanInputChange = (field, value) => {
    setNewPlan((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setIsPlanCreationButtonDisabled(!newPlan.title.trim() || !allTasksForPlan.length);
  }, [newPlan.title, allTasksForPlan]);

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
      setNewTask((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handlePickerChange = (event, selectedValue) => {
    if (event.type === 'set' && selectedValue) {
      if (pickerMode === 'date') {
        // Здесь логика, если хотите дату, а не время
      } else {
        setNewTask((prev) => ({
          ...prev,
          [pickerField]: selectedValue,
        }));
      }
    }
    setShowPicker(false);
  };

  useEffect(() => {
    setIsCreationButtonDisabled(!newTask.title.trim());
    setNewTask((prev) => ({ ...prev, dayNumber: currentDay }));
  }, [newTask.title]);

  const handleTagToggle = (tagLabel) => {
    setNewTask((prevTask) => ({
      ...prevTask,
      tag: prevTask.tag === tagLabel ? '' : tagLabel
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Поля ввода Названия и Описания плана */}
        <View style={{ padding: 15, paddingBottom: 0 }}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Название плана</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите название плана"
              maxLength={30}
              value={newPlan.title}
              onChangeText={(text) => handlePlanInputChange('title', text)}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Описание плана</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Введите описание плана"
              value={newPlan.description}
              maxLength={250}
              onChangeText={(desc) => handlePlanInputChange('description', desc)}
            />
          </View>
        </View>

        {/* Дни (Swiper) */}
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
                setWeekOffset(weekOffset + newIndex);
                swiper.current.scrollTo(1, false);
              }, 100);
            }}
          >
            {days.map((daySet, index) => (
              <View style={styles.itemRow} key={index}>
                {daySet.map((item, dateIndex) => {
                  const isActive = currentDay === item.dayIndex;
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => changeDayTasks(item.dayIndex)}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#76182a',
                            borderColor: '#76182a',
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
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={styles.subtitle}>Задачи для дня {currentDay + 1}</Text>
          <View style={styles.container}>
            <Button
              style={{ marginLeft: 5, marginBottom: 15, borderWidth: 0.5, borderColor: '#76182a'}}
              labelStyle={{ color: '#000' }}
              onPress={handleOpenBottomSheet}
            >
              Добавить задачу
            </Button>
            <FlatList
              data={allTasksForPlan.filter((task) => task.dayNumber === currentDay)}
              renderItem={renderTaskItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>

        {/* Кнопка "Создать план" */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, isPlanCreationButtonDisabled && styles.btnDisabled]}
            disabled={isPlanCreationButtonDisabled}
            onPress={handlePlanToServer}
          >
            <Text style={styles.btnText}>Создать!</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BottomSheet для создания новой задачи */}
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
              placeholder="Введите подробности задачи"
              multiline
              value={newTask.description}
              onChangeText={(text) => handleTaskInputChange('description', text)}
            />
          </View>

          <View style={styles.toggleContainer}>
            <Text>Указать время:</Text>
            <Switch
              thumbColor={showTimeTaskFields ? 'white' : 'gray'}
              trackColor={{ false: '#76182a', true: '#76182a' }}
              style={{ transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }] }}
              value={showTimeTaskFields}
              onValueChange={setShowTimeTaskFields}
            />
          </View>

          {/* Теги */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Теги</Text>
            <FlatList
              data={availableTags}
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

          {showTimeTaskFields && (
            <View style={styles.timeContainer}>
              <View style={styles.timeField}>
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
              <View style={styles.timeField}>
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

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Прием пищи</Text>
            <Switch
              value={newTask.isMeal}
              onValueChange={(value) => handleTaskInputChange('isMeal', value)}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Обязательность</Text>
            <Switch
              value={newTask.isMandatory}
              onValueChange={(value) => handleTaskInputChange('isMandatory', value)}
            />
          </View>

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

      {/* Модальное окно для DateTimePicker */}
      {showPicker && (
        <View style={styles.pickerModal}>
          <View style={styles.pickerInnerContainer}>
            <DateTimePicker
              value={
                newTask[pickerField] instanceof Date
                  ? newTask[pickerField]
                  : new Date()
              }
              mode={pickerMode}
              is24Hour
              display="spinner"
              onChange={handlePickerChange}
              style={{ width: '100%' }}
            />
            <Button
              onPress={() => setShowPicker(false)}
              mode="contained"
              style={{ marginTop: 10, backgroundColor: 'black' }}
            >
              Закрыть
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Пример стилей для задачи и кнопки "Удалить"
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    paddingRight: 42,
    justifyContent: 'space-between'
  },
  deleteButton: {
    backgroundColor: '#b00000',
    paddingVertical: 10,
    paddingHorizontal: 9,
    marginBottom: 6,
    marginLeft: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  pickerInnerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '90%'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    paddingTop: 10,
  },
  tag: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  selectedTag: {
    borderWidth: 2,
    borderColor: '#76182a',
  },
  tagText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedTagText: {
    color: '#76182a',
    fontWeight: 'bold',
  },
  picker: {
    flex: 1,
    maxHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    minWidth: width / 8.7,
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
    justifyContent: 'flex-start',
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
  btnDisabled: {
    backgroundColor: '#B0BEC5', // Светло-серый цвет для неактивной кнопки
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeField: {
    flex: 1,
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    color: '#76182a',
    paddingVertical: 8,
  },
});

export default PlanCreationScreen;
