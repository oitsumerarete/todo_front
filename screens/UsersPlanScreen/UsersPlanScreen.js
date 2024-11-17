// PlanScreen.js

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button,
  Switch,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import TaskItem from './TaskItem';
import API_URL from '../../config';
import DateTimePicker from '@react-native-community/datetimepicker';

const PlanScreen = () => {
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [plan, setPlan] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState();
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  const [pickerField, setPickerField] = useState(null); // Whi
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date(), // Дата задачи по умолчанию — выбранная дата
    startTime: new Date(),
    endTime: new Date(),
    isMandatory: false,
  });
  const [loading, setLoading] = useState(false);
  const [taskSummaryByDate, setTaskSummaryByDate] = useState({});
  const bottomSheetRef = useRef(null); // Bottom sheet ref
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close(); // Collapse the bottom sheet (hide it)
  };

  const handleInputChange = (field, value) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleCreateTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(newTask)
      const response = await axios.post(
        `${API_URL}/plans/${plan.planId}/tasks`,
        { ...newTask, planId: plan.planId, endTime: newTask.endTime.toLocaleTimeString(), startTime: newTask.startTime.toLocaleTimeString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdTask = response.data;

      setTasksByDate((prev) => {
        const updatedTasks = { ...prev };
        const date = createdTask.date.split('T')[0];
    
        if (!updatedTasks[date]) {
            updatedTasks[date] = []; // Initialize a new array if it doesn't exist
        }
        updatedTasks[date] = [...updatedTasks[date], createdTask]; // Ensure a new array instance
        return updatedTasks;
      });    

      setMarkedDates((prev) => ({
        ...prev,
        [newTask.date]: { marked: true },
      }));

      handleCloseBottomSheet();
      setNewTask({
        title: '',
        description: '',
        date: selectedDate,
        startTime: new Date(),
        endTime: new Date(),
        isMandatory: false,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date().toISOString().split('T')[0]);
    }, 60000); // Обновляем каждые 60 секунд на случай смены дня

    return () => clearInterval(interval);
  }, []);


  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);
  
  const fetchPlan = useCallback(async () => {
    try {
      let tasks = [];
      const tasksByDateTemp = {};
      const markedDatesTemp = {};
      const taskSummaryByDateTemp = {};
  
      const token = await getBearerToken();
  
      const response = await axios.get(`${API_URL}/plans/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      tasks = response.data?.tasks;
  
      tasks.forEach((task) => {
        const date = task.date.split('T')[0];
        if (!tasksByDateTemp[date]) {
          tasksByDateTemp[date] = [];
        }
        tasksByDateTemp[date].push(task);
        markedDatesTemp[date] = { marked: true };
  
        // Initialize counters for the date if not already initialized
        if (!taskSummaryByDateTemp[date]) {
          taskSummaryByDateTemp[date] = {
            mandatoryNotDone: 0,
            totalTasks: 0,
          };
        }
  
        // Increment counters
        taskSummaryByDateTemp[date].totalTasks++;
        if (task.isMandatory && task.status !== 'done') {
          taskSummaryByDateTemp[date].mandatoryNotDone++;
        }
      });
  
      setPlan(response.data);
      setTasksByDate(tasksByDateTemp);
      setMarkedDates(markedDatesTemp);
  
      // Store task summary
      setTaskSummaryByDate(taskSummaryByDateTemp);
  
      // Set the initial selected date to today if it exists in tasks
      const today = new Date().toISOString().split('T')[0];
      if (tasksByDateTemp[today]) {
        setSelectedDate(today);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, [getBearerToken]);
  

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const renderItem = ({ item, index, drag, isActive }) => (
    <TaskItem
      item={item}
      drag={drag}
      isActive={isActive}
      isToday={selectedDate === today} // Проверяем, относится ли задача к сегодняшнему дню
      onStatusChange={(taskId, isMandatory, newStatus) => {
        if (selectedDate === today) {
          setTaskSummaryByDate((prevSummary) => {
            const date = item.date.split('T')[0];
            const updatedSummary = { ...prevSummary };
  
            if (newStatus === 'done' && isMandatory) {
              updatedSummary[date].mandatoryNotDone -= 1;
            } else if (newStatus === 'pending' && isMandatory) {
              updatedSummary[date].mandatoryNotDone += 1;
            }
  
            return updatedSummary;
          });
  
          setTasksByDate((prevTasks) => {
            const date = item.date.split('T')[0];
            const updatedTasks = { ...prevTasks };
            const updatedTaskList = updatedTasks[date].map((task) =>
              task.taskId === taskId ? { ...task, status: newStatus } : task
            );
  
            updatedTasks[date] = updatedTaskList;
            return updatedTasks;
          });
        }
      }}
    />
  );

  const onDragEnd = ({ data }) => {
    // Update the order of tasks in tasksByDate for the selected date
    setTasksByDate((prevTasksByDate) => ({
      ...prevTasksByDate,
      [selectedDate]: data,
    }));
  };

  const tasksForSelectedDate = useMemo(
    () => tasksByDate[selectedDate] || [],
    [tasksByDate, selectedDate]
  );

  console.log(tasksForSelectedDate)

  // Function to handle opening the bottom sheet
  const handleOpenBottomSheet = useCallback(() => {
      bottomSheetRef.current?.expand();
  }, []);

  const showDatePicker = (field) => {
    setPickerMode(field === 'date' ? 'date' : 'time');
    setPickerField(field);
    setShowPicker(true);
  };
  const handlePickerChange = (event, selectedValue) => {
    setShowPicker(false);

    if (selectedValue) {
      const updatedValue =
        pickerMode === 'date'
          ? selectedValue.toISOString().split('T')[0]
          : selectedValue;

      setNewTask((prev) => ({
        ...prev,
        [pickerField]: updatedValue,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Plan Description */}
      <View style={styles.planDescription}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planDetails}>{plan.description}</Text>
      </View>

      {/* Calendar */}
      <Calendar
        current={selectedDate || new Date().toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            selectedColor: '#00adf5',
            marked: markedDates[selectedDate]?.marked,
          },
          ...Object.entries(taskSummaryByDate).reduce((acc, [date, summary]) => {
            acc[date] = {
              ...markedDates[date],
              dotColor: summary.mandatoryNotDone > 0 ? 'red' : 'green', // Example: Red for pending tasks
              customText: `${summary.mandatoryNotDone} left`, // Custom data
            };
            return acc;
          }, {}),
        }}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
        }}
      />


      {/* Tasks for the Selected Day */}
      {selectedDate && (
        <View style={styles.taskListContainer}>
          <Text style={styles.tasksHeader}>
            Tasks for {selectedDate} ({taskSummaryByDate[selectedDate]?.mandatoryNotDone || 0} mandatory left)
          </Text>

          <DraggableFlatList
            data={tasksForSelectedDate}
            renderItem={renderItem}
            keyExtractor={(item) => item.taskId.toString() + item.createdAt}
            onDragEnd={onDragEnd}
          />
        </View>
      )}

      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={handleOpenBottomSheet}
      />

      {/* Bottom Sheet for Task Creation */}
      <BottomSheet ref={bottomSheetRef} snapPoints={['72%']} index={-1}>
        <View style={styles.contentContainer}>
          <Text style={styles.header}>Create New Task</Text>
          
          {/* Название задачи */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={newTask.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          {/* Описание задачи */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              multiline
              value={newTask.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />
          </View>

          {/* Дата и время */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => showDatePicker('date')}>
              <Text style={styles.dateText}>
                {newTask.date ? new Date(newTask.date).toDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity onPress={() => showDatePicker('startTime')}>
                <Text style={styles.dateText}>
                  {newTask.startTime
                    ? new Date(newTask.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity onPress={() => showDatePicker('endTime')}>
                <Text style={styles.dateText}>
                  {newTask.endTime
                    ? new Date(newTask.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Обязательность */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Is Mandatory?</Text>
            <Switch
              value={newTask.isMandatory}
              onValueChange={(value) => handleInputChange('isMandatory', value)}
            />
          </View>

          {/* Кнопка создания задачи */}
          <Button title="Create Task" onPress={handleCreateTask} />
        </View>
      </BottomSheet>
      {/* DateTimePicker */}
      {showPicker && (
        <DateTimePicker
          value={pickerField === 'date' ? new Date(newTask.date) : newTask[pickerField]}
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
    marginHorizontal: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  container: { flex: 1 },
  planDescription: { padding: 16, backgroundColor: '#f7f7f7' },
  planTitle: { fontSize: 24, fontWeight: 'bold' },
  planDetails: { fontSize: 16, marginTop: 8 },
  taskListContainer: { flex: 1, padding: 16 },
  tasksHeader: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#00adf5' },
  contentContainer: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
