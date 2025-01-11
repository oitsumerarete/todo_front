import React from "react";
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const tasks = [
  {
    taskId: 270,
    title: "Introduction to Photography",
    description: "Basics of camera handling",
    status: "pending",
  },
  {
    taskId: 262,
    title: "Composition Techniques",
    description: "Learn different composition methods",
    status: "completed",
  },
  // Добавьте другие задачи из вашего массива
];

const TodayTasks = () => {
  const renderItem = ({ item }) => {
    const isCompleted = item.status === "completed";

    return (
      <View style={styles.taskContainer}>
        <View style={styles.taskInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={isCompleted ? "green" : "gray"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.taskId.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
});

export default TodayTasks;
