import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../config';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {    
    // Проверка токена при загрузке экрана
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('Поиск'); // Если токен есть, перенаправляем на HomeScreen
      }
    };
    checkToken();
  }, []);

  const login = async () => {
    const specialemail = 'admin';
    const specialPassword = 'admin';

    // Проверка на специальные учетные данные
    if (email === specialemail && password === specialPassword) {
      setEmail(specialemail);
      // Сохраняем фиктивный токен в AsyncStorage
      await AsyncStorage.setItem('token', 'special-token');
      alert('Logged in as admin!');                                                                          
      navigation.replace('Поиск');
      return; // Прерываем выполнение дальнейшего кода
    }
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token } = response.data;
      await AsyncStorage.setItem('token', token);

      navigation.replace('Поиск');
    } catch (error) {
      console.error('Login error', error);
      alert('Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Почта"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Войти" onPress={login} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  link: {
    color: 'blue',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default LoginScreen;
