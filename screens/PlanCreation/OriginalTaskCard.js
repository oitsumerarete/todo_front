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
    if (!time) return '';
    if (typeof time === 'string') return time.slice(0, 5); // Обрезаем секунды, если строка "HH:mm:ss"
    if (time instanceof Date) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return String(time);
  };

  const getFirstNWords = (text, n) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > n
      ? words.slice(0, n).join(' ') + '...'
      : text;
  };

  const tagData = availableTags.find(tag => tag.label === task.tag);

  return (
    <View style={styles.card}>
      {/* Изображение сбоку */}
      {task.image && (
        <Image source={{ uri: task.image }} style={styles.image} />
      )}
      {/* Текстовый блок */}
      <View style={styles.textContainer}>
        <View>
          <Text style={styles.title}>{task.title}</Text>
          {task.description && (
          <Text style={styles.description}>
            {getFirstNWords(task.description, 6)}
          </Text>
          )}
          {task.startTime && task.endTime && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Время:</Text>
              <Text style={styles.value}>
                {formatTime(task.startTime)} - {formatTime(task.endTime)}
              </Text>
            </View>
          )}
        </View>
        {/* Тег размещён в самом низу блока */}
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
        {task.tag && <Text
          style={[
            styles.status,
            { backgroundColor: "#FFE4E6" || 'transparent', color: '#660', fontWeight: 600 }
          ]}
        >
          {task.tag}
        </Text>}
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
    flexDirection: "row", // Горизонтальное расположение изображения и текста
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
    justifyContent: "space-between", // Раздвигаем содержимое так, чтобы тег оказался внизу
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  status: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
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
