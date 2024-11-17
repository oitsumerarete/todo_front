import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import API_URL from '../../config'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TaskItem = ({ item, drag, isActive, isToday, onStatusChange }) => {
  const [isChecked, setIsChecked] = useState(item.status === 'done'); // Initialize from item.status

  const handleChangeTaskStatus = async () => {
    if (!isToday) return; // Блокируем изменения для задач не сегодняшнего дня

    const newStatus = isChecked ? 'pending' : 'done';
    setIsChecked(!isChecked);

    // Notify the parent about the status change
    onStatusChange(item.taskId, item.isMandatory, newStatus);

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API_URL}/plans/tasks/${item.taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { backgroundColor: isActive ? '#e0e0e0' : '#ffffff' },
        !isToday && styles.disabledTask, // Применяем прозрачность для задач не сегодняшнего дня
      ]}
      onLongPress={drag}
      delayLongPress={150}
    >
      <View style={styles.taskContent}>
        <View style={styles.textContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
          <Text style={styles.taskTime}>
            {item.startTime} - {item.endTime}
          </Text>
          {item.isMandatory && <Text style={styles.mandatory}>Mandatory Task</Text>}
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            status={isChecked ? 'checked' : 'unchecked'}
            onPress={handleChangeTaskStatus}
            disabled={!isToday} // Отключаем радиокнопку для задач не сегодняшнего дня
            style={[styles.radioButton, { border: '1px' }]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};



export default TaskItem;

const styles = StyleSheet.create({
  radioButtonContainer: {
    borderWidth: 1,
    borderColor: '#ccc', // Color of the border
    borderRadius: 12, // Match the border radius of the radio button
  },
  taskItem: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    opacity: 1, // Полная видимость по умолчанию
  },
  disabledTask: {
    opacity: 0.5, // Уменьшенная прозрачность для недоступных задач
  },
  
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
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
  radioButton: {
    marginRight: 8,
  },
  mandatory: {
    fontSize: 12,
    color: 'red',
    marginBottom: 4,
  },
});
