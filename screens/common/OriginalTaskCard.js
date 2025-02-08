import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const availableTags = [
  { label: 'Фитнес', color: '#FFE4E6' },
  { label: 'Питание', color: '#FFF5E6' },
  { label: 'Работа', color: '#FFFFE6' },
  { label: 'Отдых', color: '#E6FFEB' },
  { label: 'Путешествия', color: '#E6F7FF' },
  { label: 'Саморазвитие', color: '#F3E6FF' },
  { label: 'Семья', color: '#FFEDED' },
  { label: 'Быт', color: '#E8FFE8' },
  { label: 'Здоровье', color: '#E8F3FF' },
  { label: 'Социальная активность', color: '#FBE8FF' },
];

const TaskCard = ({ task }) => {
  const formatTime = (time) => {
    if (!time) return '';
    if (typeof time === 'string') return time.slice(0, 5); // Обрезаем секунды, если это строка "HH:mm:ss"
    if (time instanceof Date) {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: undefined });
    }
    return String(time);
  };

  // Функция для получения первых n слов из строки
  const getFirstNWords = (text, n) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > n
      ? words.slice(0, n).join(' ') + '...'
      : text;
  };

  return (
    <View style={styles.card}>
      {/* Изображение сбоку */}
      {task.mainImageLink && (
        <Image source={{ uri: task.mainImageLink }} style={styles.image} />
      )}
      {/* Контейнер для текста */}
      <View style={styles.textContainer}>
        <View style={styles.header}>
          {/* Ограничиваем заголовок одной строкой */}
          <Text style={styles.title}>
            {task.title}
          </Text>
        </View>
        {/* Выводим описание, если оно есть */}
        {task.description && (
          <Text style={styles.description}>
            {getFirstNWords(task.description, 6)}
          </Text>
        )}
        {((task.startTime && task.endTime) || task.tag) && (
            <View style={styles.timeTagContainer}>
              {task.tag && (
                <Text style={[styles.status]}>
                  {task.tag}
                </Text>
              )}

              {task.startTime && task.endTime && (
                <Text style={[styles.timeBox, task.tag ? {
                  marginLeft: 20} : null]}>
                  {formatTime(task.startTime)} - {formatTime(task.endTime)}
                </Text>
              )}
            </View>
          )}
        {task.isMeal && (
          <View style={styles.nutrientsContainer}>
            <Text style={[styles.nutrientText, { color: '#5CB85C' }]}>
              Б: {Math.round(task.protein) || 0}
            </Text>
            <Text style={[styles.nutrientText, { color: '#F0AD4E' }]}>
              Ж: {Math.round(task.fats) || 0}
            </Text>
            <Text style={[styles.nutrientText, { color: '#5BC0DE' }]}>
              У: {Math.round(task.carbs) || 0}
            </Text>
            <Text style={[styles.nutrientText, { color: '#D9534F' }]}>
              Ккал: {Math.round(task.calories) || 0}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8, // Отступ между заголовком и тегом
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
  description: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
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

export default TaskCard;
