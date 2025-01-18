import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const TaskCard = ({ task }) => {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
        {task.duration && <Text style={styles.duration}>Длительность: {task.durationMinutes} мин.</Text>}
        {task.isMandatory && <Text style={styles.mandatory}>Обязательная задача</Text>}
      </View>
      <Image
        source={{ uri: task.image }}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 15,
    flexDirection: 'row', // Размещаем элементы в строку
    alignItems: 'center', // Выравниваем элементы по вертикали
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1, // Занимает оставшееся пространство
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#888',
  },
  mandatory: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginLeft: 10, // Отступ между текстом и изображением
  },
});

export default TaskCard;
