import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskCard = ({ task }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
      {task.duration && <Text style={styles.duration}>Длительность: {task.durationMinutes} мин.</Text>}
      {task.isMandatory && <Text style={styles.mandatory}>Mandatory Task</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  day: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 4,
  },
  mandatory: {
    fontSize: 12,
    color: 'red',
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 10,
    color: 'gray',
    marginTop: 8,
  },
});

export default TaskCard;
