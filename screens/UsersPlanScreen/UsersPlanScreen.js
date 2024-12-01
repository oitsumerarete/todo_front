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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import { FAB } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

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
  });
  const [taskSummaryByDate, setTaskSummaryByDate] = useState({});
  const bottomSheetRef = useRef(null);
  const [today, setToday] = useState(todayDate);

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

      const { planId, title, description } = response.data;
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

  const onStatusChange = (taskId, isMandatory, newStatus, taskDate) => {
    setTaskSummaryByDate((prevSummary) => {
      const date = taskDate;
      const updatedSummary = { ...prevSummary };

      if (isMandatory) {
        if (newStatus === 'done') {
          updatedSummary[date].mandatoryNotDone -= 1;
        } else if (newStatus !== 'done') {
          updatedSummary[date].mandatoryNotDone += 1;
        }
      }

      return updatedSummary;
    });

    setTasksByDate((prevTasks) => {
      const date = taskDate;
      console.log('date123', date)
      const updatedTasks = {
        ...prevTasks,
        [date]: prevTasks[date].map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        ),
      };
      return updatedTasks;
    });
  };

  const renderItem = ({ item, index, drag, isActive }) => {
    const itemDateLocal = new Date(item.date).toLocaleDateString('en-CA');
  
    return (
      <TaskItem
        item={item}
        drag={drag}
        isActive={isActive}
        isToday={isSameDay(itemDateLocal, todayDate)}
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

  const mergedMarkedDates = { ...markedDates };
  Object.entries(taskSummaryByDate).forEach(([date, summary]) => {
    mergedMarkedDates[date] = {
      ...mergedMarkedDates[date],
      dotColor: summary.mandatoryNotDone > 0 ? 'red' : 'green',
    };
  });

  if (selectedDate) {
    mergedMarkedDates[selectedDate] = {
      ...(mergedMarkedDates[selectedDate] || {}),
      selected: true,
      selectedColor: '#00adf5',
    };
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Plan Description */}
      <View style={styles.planDescription}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        <Text style={styles.planDetails}>{plan.description}</Text>
      </View>

      {/* Calendar */}
      <Calendar
        current={selectedDate || todayDate}
        onDayPress={handleDayPress}
        markedDates={mergedMarkedDates}
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
            Tasks for {format(selectedDate, 'dd.MM')} (
            {taskSummaryByDate[selectedDate]?.mandatoryNotDone || 0} mandatory
            left)
          </Text>

          <DraggableFlatList
            data={tasksForSelectedDate}
            renderItem={renderItem}
            keyExtractor={(item) => item.taskId.toString()}
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

          {/* Task Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={newTask.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </View>

          {/* Task Description */}
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

          {/* Date and Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => showDatePicker('date')}>
              <Text style={styles.dateText}>
                {newTask.date
                  ? new Date(newTask.date).toDateString()
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity onPress={() => showDatePicker('startTime')}>
                <Text style={styles.dateText}>
                  {newTask.startTime
                    ? newTask.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity onPress={() => showDatePicker('endTime')}>
                <Text style={styles.dateText}>
                  {newTask.endTime
                    ? newTask.endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Is Mandatory */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Is Mandatory?</Text>
            <Switch
              value={newTask.isMandatory}
              onValueChange={(value) => handleInputChange('isMandatory', value)}
            />
          </View>

          {/* Create Task Button */}
          <Button title="Create Task" onPress={handleCreateTask} />
        </View>
      </BottomSheet>

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
  container: { flex: 1 },
  planDescription: { padding: 16, backgroundColor: '#f7f7f7' },
  planTitle: { fontSize: 24, fontWeight: 'bold' },
  planDetails: { fontSize: 16, marginTop: 8 },
  taskListContainer: { flex: 1, padding: 16 },
  tasksHeader: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: '#00adf5',
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
    marginHorizontal: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
