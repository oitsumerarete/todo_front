// PlanScreen.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Button
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';
import BottomSheet from '@gorhom/bottom-sheet';
import { FAB } from 'react-native-paper';
import axios from 'axios';

const API_URL = 'http://localhost:3000/plans/user';

const PlanScreen = () => {
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [plan, setPlan] = useState([]);
  const [newTask, setNewTask] = useState(''); // State for new task input
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef(null); // Bottom sheet ref
  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.close(); // Collapse the bottom sheet (hide it)
  };

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

      const token = await getBearerToken();

      const response = await axios.get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      tasks = response.data?.tasks;

      tasks.forEach((task) => {
        const date = task.createdAt.split('T')[0];
        if (!tasksByDateTemp[date]) {
          tasksByDateTemp[date] = [];
        }
        tasksByDateTemp[date].push(task);
        markedDatesTemp[date] = { marked: true };
      });

      delete response.data?.tasks;
      setPlan(response.data)
      setTasksByDate(tasksByDateTemp);
      setMarkedDates(markedDatesTemp);

      // Set the initial selected date to today if it exists in tasks
      const today = new Date().toISOString().split('T')[0];
      if (tasksByDateTemp[today]) {
        setSelectedDate(today);
      }
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
  })

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          { backgroundColor: isActive ? '#e0e0e0' : '#ffffff' },
        ]}
        onLongPress={drag}
        delayLongPress={150}
      >
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskTime}>
          {item.startTime} - {item.endTime}
        </Text>
      </TouchableOpacity>
    );
  };

  const onDragEnd = ({ data }) => {
    // Update the order of tasks in tasksByDate for the selected date
    setTasksByDate((prevTasksByDate) => ({
      ...prevTasksByDate,
      [selectedDate]: data,
    }));
  };

  const tasksForSelectedDate = tasksByDate[selectedDate] || [];


  // Points where the bottom sheet will snap to
  const snapPoints = ['25%', '50%'];

  // Function to handle opening the bottom sheet
  const handleOpenBottomSheet = useCallback(() => {
      bottomSheetRef.current?.expand();
  }, []);

  // Function to handle task creation logic
  const handleCreateTask = () => {
      if (newTask.trim()) {
          console.log('Task created:', newTask);
          setNewTask(''); // Clear the input field after creation
          bottomSheetRef.current?.close(); // Close the bottom sheet
      } else {
          console.log('Task title is empty');
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
            Tasks for {selectedDate}
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
      <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={-1} // initially closed
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.header}>Create New Task</Text>

                    {/* Task input field */}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Task Title"
                        value={newTask}
                        onChangeText={setNewTask}
                    />

                    {/* Button to create task */}
                    <Button onPress={handleCreateTask} title="Create Task" mode="contained">
                        Create Task
                    </Button>
                    {/* Add a close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCloseBottomSheet}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
                </View>
            </BottomSheet>
    </SafeAreaView>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  planDescription: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  planDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  taskListContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
   
  },
  fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: '#3498db',
  },
  contentContainer: {
      flex: 1,
      padding: 16,
  },
  header: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 5,
      width: '100%',
      marginBottom: 15,
  },
  tasksHeader: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  taskItem: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
