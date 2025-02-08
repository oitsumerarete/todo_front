import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const TaskItem = memo(({ item, drag, onPress, isActive, isToday, onStatusChange, isChecked, isTodayDayComleted }) => {
  const getFirstNWords = (text, n) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > n ? words.slice(0, n).join(' ') + '...' : text;
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (typeof time === 'string') return time.slice(0, 5); // Получаем формат "HH:mm"
    if (time instanceof Date) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return String(time);
  };

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
      onPress={onPress}
      onLongPress={drag}
      delayLongPress={150}
    >
      <View style={styles.taskContent}>
        {item.mainImageLink && <Image
          style={styles.taskImage}
          source={{ uri: item.mainImageLink }}
        />}
        <View style={styles.textContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.isMandatory && (
              <MaterialIcons
                name="error-outline"
                size={18}
                color="#76182a"
                style={styles.mandatoryIcon}
              />
            )}
          </View>
          {item.description && (
            <Text style={styles.description}>
              {getFirstNWords(item.description, 6)}
            </Text>
          )}
          {((item.startTime && item.endTime) || item.tag) && (
            <View style={styles.timeTagContainer}>
              {item.tag && (
                <Text style={[styles.status]}>
                  {item.tag}
                </Text>
              )}

              {item.startTime && item.endTime && (
                <Text style={[styles.timeBox, item.tag ? {
                  marginLeft: 20} : null]}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              )}
            </View>
          )}
          {item.isMeal && (
            <View style={styles.nutrientsContainer}>
              <Text style={[styles.nutrientText, { color: '#5CB85C' }]}>
                Б: {Math.round(item.protein || 0)}
              </Text>
              <Text style={[styles.nutrientText, { color: '#F0AD4E' }]}>
                Ж: {Math.round(item.fats || 0)}
              </Text>
              <Text style={[styles.nutrientText, { color: '#5BC0DE' }]}>
                У: {Math.round(item.carbs || 0)}
              </Text>
              <Text style={[styles.nutrientText, { color: '#D9534F' }]}>
                Ккал: {Math.round(item.calories || 0)}
              </Text>
            </View>
          )}
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
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
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
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  mandatoryIcon: {
    marginLeft: 5,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    marginBottom: 4,
  },
  taskImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginLeft: 5,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  nutrientText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
    backgroundColor: "#FFE4E6",
    color: '#660',
  },
  timeTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeBox: {
    backgroundColor: '#E8F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 14,
    color: '#4d4d4d',
    fontWeight: '600',
  },
});
