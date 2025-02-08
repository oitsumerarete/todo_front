// WeekCalendar.js
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder } from 'react-native';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';

const SWIPE_THRESHOLD = 50;

const ruDayAbbreviations = {
  0: 'Вс', // воскресенье
  1: 'Пн', // понедельник
  2: 'Вт', // вторник
  3: 'Ср', // среда
  4: 'Чт', // четверг
  5: 'Пт', // пятница
  6: 'Сб', // суббота
};

const WeekCalendar = ({ current, onDayPress, markedDates, selectedDate }) => {
  // Сдвиг недели относительно базовой недели (0 – текущая неделя)
  const [weekOffset, setWeekOffset] = useState(0);

  // Вычисляем начало недели с учётом смещения
  const baseDate = new Date(current);
  const weekStart = addWeeks(startOfWeek(baseDate, { weekStartsOn: 1 }), weekOffset);

  // Настраиваем PanResponder для обработки свайпов
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setWeekOffset((prev) => prev - 1); // предыдущая неделя
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          setWeekOffset((prev) => prev + 1); // следующая неделя
        }
      },
    })
  ).current;

  // Формируем массив из 7 дней недели
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {days.map((day) => {
        const dayString = format(day, 'yyyy-MM-dd');
        const isSelected = selectedDate === dayString;
        const isMarked = markedDates && markedDates[dayString];
        return (
          <TouchableOpacity
            key={dayString}
            style={[styles.dayContainer, isSelected && styles.selectedDay]}
            onPress={() => onDayPress({ dateString: dayString })}
          >
            <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
              {ruDayAbbreviations[day.getDay()]}
            </Text>
            <Text style={[styles.dateText, isSelected && styles.selectedDayText]}>
              {format(day, 'd', { locale: ru })}
            </Text>
            {isMarked && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dayContainer: {
    alignItems: 'center',
    padding: 5,
  },
  selectedDay: {
    backgroundColor: '#76182a',
    borderRadius: 20,
    padding: 10,
  },
  dayText: {
    fontSize: 12,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'gray',
    marginTop: 2,
  },
});

export default WeekCalendar;
