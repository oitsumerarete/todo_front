// PlanScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DraggableFlatList from 'react-native-draggable-flatlist';

const data = {
  planId: 13,
  userId: 7,
  title: "Weight Loss Plan",
  description: "A comprehensive plan for losing weight",
  details: "Detailed meal and workout plans",
  category: "Weight Loss",
  isPublic: true,
  likesCount: 10,
  version: 1,
  createdAt: "2024-10-05T08:12:21.521Z",
  updatedAt: "2024-10-05T08:12:21.521Z",
  tasks: [
    {
      taskId: 1,
      planId: 13,
      userId: 7,
      title: "Morning Workout1",
      description: "Complete a 30-minute workout",
      taskOrder: 1,
      durationMinutes: 30,
      isRepeating: true,
      isMandatory: true,
      repeatType: "daily",
      repeatDays: "Mon,Tue,Wed,Thu,Fri",
      tagId: 12,
      startTime: "06:00:00",
      endTime: "06:30:00",
      status: "completed",
      calories: 300.5,
      protein: 25,
      carbs: 40,
      fats: 10,
      createdAt: "2024-10-12T06:00:00",
      updatedAt: "2024-10-12T06:30:00",
    },
    {
      taskId: 2,
      planId: 13,
      userId: 7,
      title: "Evening Yoga2",
      description: "Attend a 1-hour yoga session",
      taskOrder: 2,
      durationMinutes: 60,
      isRepeating: true,
      isMandatory: false,
      repeatType: "daily",
      repeatDays: "Mon,Wed,Fri",
      tagId: 13,
      startTime: "18:00:00",
      endTime: "19:00:00",
      status: "pending",
      calories: 200,
      protein: 10,
      carbs: 20,
      fats: 5,
      createdAt: "2024-10-12T18:00:00",
      updatedAt: "2024-10-12T19:00:00",
    },
    {
      taskId: 3,
      planId: 13,
      userId: 7,
      title: "Evening Yoga3",
      description: "Attend a 1-hour yoga session",
      taskOrder: 2,
      durationMinutes: 60,
      isRepeating: true,
      isMandatory: false,
      repeatType: "daily",
      repeatDays: "Mon,Wed,Fri",
      tagId: 13,
      startTime: "18:00:00",
      endTime: "19:00:00",
      status: "pending",
      calories: 200,
      protein: 10,
      carbs: 20,
      fats: 5,
      createdAt: "2024-10-13T18:00:00",
      updatedAt: "2024-10-13T19:00:00",
    },
    {
      taskId: 4,
      planId: 13,
      userId: 7,
      title: "Evening Yoga4",
      description: "Attend a 1-hour yoga session",
      taskOrder: 2,
      durationMinutes: 60,
      isRepeating: true,
      isMandatory: false,
      repeatType: "daily",
      repeatDays: "Mon,Wed,Fri",
      tagId: 13,
      startTime: "18:00:00",
      endTime: "19:00:00",
      status: "pending",
      calories: 200,
      protein: 10,
      carbs: 20,
      fats: 5,
      createdAt: "2024-10-13T18:00:00",
      updatedAt: "2024-10-13T19:00:00",
    },
  ],
};

const PlanScreen = () => {
  const [tasksByDate, setTasksByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const tasks = data.tasks;
    const tasksByDateTemp = {};
    const markedDatesTemp = {};

    tasks.forEach((task) => {
      const date = task.createdAt.split('T')[0];
      if (!tasksByDateTemp[date]) {
        tasksByDateTemp[date] = [];
      }
      tasksByDateTemp[date].push(task);
      markedDatesTemp[date] = { marked: true };
    });

    setTasksByDate(tasksByDateTemp);
    setMarkedDates(markedDatesTemp);

    // Set the initial selected date to today if it exists in tasks
    const today = new Date().toISOString().split('T')[0];
    if (tasksByDateTemp[today]) {
      setSelectedDate(today);
    }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Plan Description */}
      <View style={styles.planDescription}>
        <Text style={styles.planTitle}>{data.title}</Text>
        <Text style={styles.planDetails}>{data.description}</Text>
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
