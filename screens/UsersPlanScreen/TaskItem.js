import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons'; // Используем библиотеку иконок

const TaskItem = memo(({ item, drag, isActive, isToday, onStatusChange, isChecked, isTodayDayComleted }) => {
  const handleChangeTaskStatus = () => {
    if (!isToday || isTodayDayComleted) return;

    const newStatus = isChecked ? 'pending' : 'done';
    onStatusChange(item.taskId, item.isMandatory, newStatus, item.taskDate);
  };

  return (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { backgroundColor: isActive ? '#e0e0e0' : '#ffffff' },
        (!isToday || isTodayDayComleted) && styles.disabledTask,
      ]}
      onLongPress={drag}
      delayLongPress={150}
    >
      <View style={styles.taskContent}>
        <Image
          style={styles.taskImage}
          source={{ uri: item.mainImageLink }}
        />
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.isMandatory && (
              <MaterialIcons
                name="error" // Иконка для обязательной задачи
                size={17}
                color="#76182a"
                style={styles.mandatoryIcon}
              />
            )}
          </View>
          <Text style={styles.taskDescription}>{item.description}</Text>
          <Text style={styles.taskTime}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            status={isChecked ? 'checked' : 'unchecked'}
            onPress={handleChangeTaskStatus}
            disabled={!isToday || isTodayDayComleted}
            color="#76182a"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default TaskItem;

const styles = StyleSheet.create({
  radioButtonContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskItem: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    opacity: 1,
  },
  disabledTask: {
    opacity: 0.5,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    paddingLeft: 15,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  mandatoryIcon: {
    marginLeft: 5,
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
  taskImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 5,
  },
});
