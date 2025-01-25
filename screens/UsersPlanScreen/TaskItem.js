import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';

const TaskItem = memo(({ item, drag, isActive, isToday, onStatusChange, isChecked, isTodayDayComleted }) => {
  const handleChangeTaskStatus = () => {
    if (!isToday || !isTodayDayComleted) return;

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
        <View style={styles.textContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
          <Text style={styles.taskTime}>
            {item.startTime} - {item.endTime}
          </Text>
          {item.isMandatory && (
            <Text style={styles.mandatory}>Обязательная задача</Text>
          )}
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton
            status={isChecked ? 'checked' : 'unchecked'}
            onPress={handleChangeTaskStatus}
            disabled={(!isToday || isTodayDayComleted)}
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
    borderColor: '#ccc', // Color of the border
    borderRadius: 30, // Match the border radius of the radio button
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
  mandatory: {
    fontSize: 12,
    color: 'red',
    marginBottom: 4,
  },
});
