import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const availableTags = [
  { label: 'Фитнес', color: '#FFE4E6' }, // приглушённый розовый
  { label: 'Питание', color: '#FFF5E6' }, // приглушённый оранжевый
  { label: 'Работа', color: '#FFFFE6' }, // приглушённый жёлтый
  { label: 'Отдых', color: '#E6FFEB' }, // приглушённый зелёный
  { label: 'Путешествия', color: '#E6F7FF' }, // приглушённый голубой
  { label: 'Саморазвитие', color: '#F3E6FF' }, // приглушённый фиолетовый
  { label: 'Семья', color: '#FFEDED' }, // приглушённый коралловый
  { label: 'Быт', color: '#E8FFE8' }, // приглушённый лаймовый
  { label: 'Здоровье', color: '#E8F3FF' }, // приглушённый синий
  { label: 'Социальная активность', color: '#FBE8FF' }, // приглушённый сиреневый
];

const TaskCard = ({ task }) => {
  const formatTime = (time) => {
    if (!time) return ''; // Проверяем, что значение не пустое
    if (typeof time === 'string') return time; // Если уже строка, просто возвращаем
    if (time instanceof Date) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Форматируем без секунд
    }
    return String(time); // На случай, если это число или другой формат
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
          <Text style={styles.title}>{task.title}</Text>
          <Text
            style={[
              styles.status,
              { backgroundColor: availableTags.find(tag => tag.label === task.tag)?.color || 'transparent', color: '#660', fontWeight: '600', }
            ]}
          >
            {task.tag}
          </Text>
        </View>
        {task.startTime && task.endTime && <View style={styles.infoRow}>
          <Text style={styles.label}>Время:</Text>
          <Text style={styles.value}>{formatTime(task.startTime)} - {formatTime(task.endTime)}</Text>
        </View>}
        {task.isMeal && <View style={styles.    nutrientsContainer}>
            <Text style={[styles.nutrientText, { color: '#5CB85C' }]}>Б: {Math.round(task.protein) || 0}</Text>
            <Text style={[styles.nutrientText, { color: '#F0AD4E' }]}>Ж: {Math.round(task.fats) || 0}</Text>
            <Text style={[styles.nutrientText, { color: '#5BC0DE' }]}>У: {Math.round(task.carbs) || 0}</Text>
            <Text style={[styles.nutrientText, { color: '#D9534F' }]}>Ккал: {Math.round(task.calories) || 0}</Text>
          </View>}
        {task.isMandatory && <Text style={styles.mandatory}>Обязательная задача</Text>}
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
    flexDirection: "row", // Горизонтальное размещение
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10, // Отступ между изображением и текстом
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1, // Для переноса текста, если он длинный
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  pending: {
    backgroundColor: "#ffebcc",
    color: "#b35900",
  },
  completed: {
    backgroundColor: "#dff0d8",
    color: "#3c763d",
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
  mandatory: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "bold",
    color: "#c0392b",
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
});

export default TaskCard;
