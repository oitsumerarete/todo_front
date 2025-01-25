import React from "react";
import { FlatList, Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TodayTasks = ({data}) => {
  const renderItem = ({ item }) => {
    const isCompleted = item.status === "done";

    return (
      <View style={styles.taskContainer}>
        <View style={styles.taskInfo}>
        <Image
          source={{ uri: item.image }}
          resizeMode="cover" // или "contain", если нужно вписать изображение
        />
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
      data={data}
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
