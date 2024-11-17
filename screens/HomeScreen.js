import React, { useCallback, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Avatar, ProgressBar, Card, Button, FAB } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import BottomSheet from '@gorhom/bottom-sheet';

export default function HomeScreen({navigation}) {
    const [newTask, setNewTask] = useState(''); // State for new task input
    const bottomSheetRef = useRef(null); // Bottom sheet ref

    // Function to handle logout
    const handleLogout = async () => {
        try {
          await AsyncStorage.removeItem('token');
          console.log('Token removed, logging out...');
          navigation.replace('Login');
        } catch (error) {
          console.log('Error clearing user token: ', error);
        }
    };

    // Points where the bottom sheet will snap to
    const snapPoints = ['25%', '50%'];

    // Function to handle opening the bottom sheet
    const handleOpenBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    // Function to handle task creation logic
    const handleCreateTask = () => {
        if (newTask.trim()) {
            console.log('Task created:', newTask);
            setNewTask(''); // Clear the input field after creation
            bottomSheetRef.current?.close(); // Close the bottom sheet
        } else {
            console.log('Task title is empty');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Top Section: User Overview */}
            <View style={styles.topSection}>
                <Avatar.Image size={60} source={{ uri: 'https://www.1zoom.me/big2/62/199578-yana.jpg' }} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>Hello, world!</Text>
                    <Text style={styles.userStatus}>Status: Focused</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Section */}
            <Card style={styles.progressCard}>
                <Card.Title title="Today's Plan Completion" />
                <ProgressBar progress={0.6} color="#3498db" style={styles.progressBar} />
                <Text style={styles.progressText}>60% Completed</Text>
            </Card>

            {/* Task List */}
            <Card style={styles.taskCard}>
                <Card.Title title="Active Tasks" />
                <View style={styles.taskItem}>
                    <TouchableOpacity style={styles.checkbox} />
                    <Text style={styles.taskText}>Finish React Native Project</Text>
                </View>
                <View style={styles.taskItem}>
                    <TouchableOpacity style={styles.checkbox} />
                    <Text style={styles.taskText}>Review PRs</Text>
                </View>
                <Button style={styles.addButton}>Add Task</Button>
            </Card>
            {/* Floating Action Button */}
            <FAB
                style={styles.fab}
                small
                icon="plus"
                onPress={handleOpenBottomSheet}
            />

            {/* Bottom Sheet for Task Creation */}
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={-1} // initially closed
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.header}>Create New Task</Text>

                    {/* Task input field */}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Task Title"
                        value={newTask}
                        onChangeText={setNewTask}
                    />

                    {/* Button to create task */}
                    <Button onPress={handleCreateTask} mode="contained">
                        Create Task
                    </Button>
                </View>
            </BottomSheet>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 16,
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    userInfo: {
        marginLeft: 16,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    userStatus: {
        fontSize: 14,
        color: '#757575',
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: '#e74c3c',
        fontWeight: 'bold',
    },
    progressCard: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    progressBar: {
        marginTop: 16,
        height: 10,
        borderRadius: 5,
    },
    progressText: {
        marginTop: 8,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#3498db',
    },
    taskCard: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3498db',
        marginRight: 16,
    },
    taskText: {
        fontSize: 16,
    },
    addButton: {
        marginTop: 12,
        backgroundColor: '#3498db',
    },
    calendarCard: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#3498db',
        zIndex: 1000,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
       
      },
      fab: {
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#3498db',
      },
      contentContainer: {
          flex: 1,
          padding: 16,
      },
      header: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
      },
      input: {
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 5,
          width: '100%',
          marginBottom: 15,
      },
  });
  