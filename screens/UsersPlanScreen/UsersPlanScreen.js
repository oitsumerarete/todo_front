// PlanScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button,
  Switch,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons'; // Используем библиотеку иконок
import TaskItem from './TaskItem';
import API_URL from '../../config';

const PlanScreen = () => {
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [plan, setPlan] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerField, setPickerField] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showTimeTaskFields, setShowTimeTaskFields] = useState(false);

  // Function to get date in 'YYYY-MM-DD' format
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getFormattedDate(new Date());

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: todayDate,
    startTime: new Date(),
    endTime: new Date(),
    isMandatory: false,
    isMeal: false,
  });
  const [taskSummaryByDate, setTaskSummaryByDate] = useState({});
  const bottomSheetRef = useRef(null);
  const [today, setToday] = useState(todayDate);
  const [isMealToday, setIsMealToday] = useState(false);
  const [pendingTask, setPendingTask] = useState(null);
  const [isTodayDayComleted, setIsTodayDayCompleted] = useState(false);
  const [originalPlanId, setOriginalPlanId] = useState();
  const [mealsStat, setMealsStat] = useState([
    { label: "ккал", value: 0, color: "#3b6b3b" },
    { label: "белки", value: 0, color: "#263d26" },
    { label: "углеводы", value: 0, color: "#3d645b" },
    { label: "жиры", value: 0, color: "#6a7346" }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(getFormattedDate(new Date()));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleInputChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const taskData = {
        ...newTask,
        planId: plan.planId,
        startTime: newTask.startTime.toLocaleTimeString([], { hour12: false }),
        endTime: newTask.endTime.toLocaleTimeString([], { hour12: false }),
      };

      const response = await axios.post(
        `${API_URL}/plans/${plan.planId}/tasks`,
        taskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdTask = response.data;
      const dateKey = newTask.date;

      // Update tasksByDate
      setTasksByDate((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey] ? [...prev[dateKey], createdTask] : [createdTask],
      }));

      // Update markedDates and task summaries
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
            mandatoryNotDone:
              (prev[dateKey]?.mandatoryNotDone || 0) + isMandatoryNotDone,
          },
        };
      });

      // Close the bottom sheet and reset newTask
      handleCloseBottomSheet();
      setNewTask({
        title: '',
        description: '',
        date: todayDate, // Set date to today in local time
        startTime: new Date(),
        endTime: new Date(),
        isMandatory: false,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const fetchPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get(`${API_URL}/plans/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { planId, title, description, originalPlanId, isDayCompleted } = response.data;
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

      setPlan({ planId, title, description });
      setOriginalPlanId(originalPlanId);
      setIsTodayDayCompleted(isDayCompleted);
      setTasksByDate(tasksByDateTemp);
      setMarkedDates(markedDatesTemp);
      setTaskSummaryByDate(taskSummaryByDateTemp);

      const todayDate = getFormattedDate(new Date());
      setSelectedDate(tasksByDateTemp[todayDate] ? todayDate : null);
    } catch (error) {
      console.error('Error fetching plan:', error);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const showDatePicker = (field) => {
    setPickerMode(field === 'date' ? 'date' : 'time');
    setPickerField(field);
    setShowPicker(true);
  };

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

  const isSameDay = (dateString1, dateString2) => {
    return dateString1 === dateString2;
  };

  const onStatusChange = async (taskId, isMandatory, newStatus, taskDate) => {
    const date = taskDate;
  
    let flag = false;
    // Обновляем taskSummaryByDate
    setTaskSummaryByDate((prevSummary) => {
      const updatedSummary = { ...prevSummary };
  
      if (!updatedSummary[date]) {
        updatedSummary[date] = { mandatoryNotDone: 0, totalTasks: 0 }; // Инициализация объекта, если его нет
      }

      if (isMandatory) {
        if (newStatus === 'done') {
          if ((updatedSummary[date].mandatoryNotDone - 1) === 0) {
            setModalVisible(true);
            setPendingTask({ taskId, date, newStatus, isLastTaskForDayToDoGoingToBeDone: true });
            flag = true;
            return prevSummary;
          }

          updatedSummary[date].mandatoryNotDone -= 1;
        } else {
          updatedSummary[date].mandatoryNotDone += 1;
        }
      }

      return updatedSummary;
    });

    if (flag === true) {
      return;
    }

    // Выполняем асинхронные действия перед обновлением состояния
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
    }
  
    // Обновляем tasksByDate
    setTasksByDate((prevTasks) => {
      const updatedTasks = {
        ...prevTasks,
        [date]: prevTasks[date].map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        ),
      };
      return updatedTasks;
    });
  };

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
        { status: newStatus, planId: plan.planId,lastTaskGoingToBeDone: isLastTaskForDayToDoGoingToBeDone, originalPlanId },
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
    // Если пользователь отменяет завершение дня
    setModalVisible(false);
    setPendingTask(null);
  };

  const renderItem = ({ item, index, drag, isActive }) => {
    const itemDateLocal = new Date(item.date).toLocaleDateString('en-CA');
  
    return (
      <TaskItem
        item={item}
        drag={drag}
        isActive={isActive}
        isTodayDayComleted={isTodayDayComleted}
        isToday={isSameDay(itemDateLocal, todayDate)}
        isChecked={item.status === 'done'}
        onStatusChange={(taskId, isMandatory, newStatus) =>
          onStatusChange(taskId, isMandatory, newStatus, new Date(item.date).toLocaleDateString('en-CA'))
        }
      />
    );
  };

  const onDragEnd = ({ data }) => {
    setTasksByDate((prevTasksByDate) => ({
      ...prevTasksByDate,
      [selectedDate]: data,
    }));
  };

  const tasksForSelectedDate = tasksByDate[selectedDate] || [];

  useEffect(() => {
    let kcal = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;

    tasksForSelectedDate.map((task) => {
      if (task.calories !== null
        && task.proteins !== null
        && task.fats !== null
        && task.carbs !== null) {
        kcal += task.calories;
        proteins += task.proteins;
        fats += task.fats;
        carbs += task.carbs;

        setIsMealToday(true);
      }
    })

    setMealsStat([
      { label: "ккал", value: kcal, color: "#3b6b3b" },
      { label: "белки", value: proteins, color: "#263d26" },
      { label: "жиры", value: fats, color: "#6a7346" },
      { label: "углеводы", value: carbs, color: "#3d645b" }
    ])
  }, [tasksByDate[selectedDate]])

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Plan Description */}
      <View style={styles.planDescriptionContainer}>
        <View style={styles.planDescription}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDetails}>{plan.description}</Text>
        </View>
        <View style={[styles.circle, styles.row]}>
          <MaterialIcons
            name="error" // Иконка для обязательной задачи
            size={25}
            color="#76182a"
            style={styles.mandatoryIcon}
          />
          <Text style={styles.text}>{taskSummaryByDate[selectedDate]?.mandatoryNotDone || 0}</Text>
        </View>

      </View>

      {/* Calendar */}
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

      {/* Tasks for the Selected Day */}
      {selectedDate && 
        <View style={styles.taskListContainer}>
          {isMealToday &&
            <View style={styles.containerPCF}>
              {mealsStat.map((stat, index) => (
                <View key={index} style={styles.statBox}>
                  <View style={[styles.bar, { backgroundColor: stat.color }]} />
                  <Text style={styles.value}>{stat.value || 0}</Text>
                  <Text style={styles.label}>{stat.label || 0}</Text>
                </View>
              ))}
            </View>
          }

          <DraggableFlatList
            data={tasksForSelectedDate}
            renderItem={renderItem}
            keyExtractor={(item) => item.taskId.toString()}
            onDragEnd={onDragEnd}
            contentContainerStyle={{ paddingBottom: 70 }}
          />
        </View>
      }

      <FAB
        style={styles.fab}
        icon={() => <Icon name="plus" size={24} color="white" />}
        onPress={handleOpenBottomSheet}
      />

      {/* Bottom Sheet for Task Creation */}
      <BottomSheet ref={bottomSheetRef} snapPoints={['74.7%']} index={-1}>
        <View style={styles.contentContainer}>
          <Text style={styles.header}>Создать задачу</Text>

          {/* Task Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Название задачи</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите название задачи"
              value={newTask.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          {/* Task Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Введите подробности задачи"
              multiline
              value={newTask.description}
              onChangeText={(text) => handleInputChange('description', text)}
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

          {/* Date and Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Дата</Text>
            <TouchableOpacity onPress={() => showDatePicker('date')}>
              <Text style={styles.dateText}>
                {newTask.date
                  ? new Date(newTask.date).toDateString()
                  : 'Выберите дату'}
              </Text>
            </TouchableOpacity>
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
          {/* Is Mandatory */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Прием пищи</Text>
            <Switch
              value={newTask.isMeal}
              onValueChange={(value) => handleInputChange('isMeal', value)}
            />
          </View>

          {/* Create Task Button */}
          <Button title="Создать задачу" onPress={handleCreateTask} />
        </View>
      </BottomSheet>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Завершение этой задачи приведет к завершению дня. Вы уверены, что хотите завершить день?
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Да, завершить день" onPress={confirmDayCompletion} />
              <Button title="Нет, отменить" onPress={cancelDayCompletion} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
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
  containerPCF: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    alignItems: "center",
    width: "22%", // Adjust width for spacing
  },
  bar: {
    width: "100%",
    height: 5,
    borderRadius: 2.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  container: { flex: 1 },
  planDescriptionContainer: {
    flexDirection: 'row', // Размещаем элементы в ряд
    alignItems: 'center', // Выравниваем по вертикали
    justifyContent: 'space-between', // Распределяем пространство
    padding: 10,
  },
  planDescription: {
    flex: 1, // Занимает оставшееся пространство
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planDetails: {
    fontSize: 16,
    color: 'gray',
  },
  circle: {
    // Ваши текущие стили для круга
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 5,
    fontSize: 20,
    color: '#000',
  },
  taskListContainer: { flex: 1, padding: 16 },
  tasksHeader: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    color: '#fff',
    backgroundColor: '#76182a',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 16,
    color: '#007bff',
    paddingVertical: 8,
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
});
