import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      const response = await axios.post('http://localhost:3000/register', {
        username,
        email,
        password,
      });

      if (response.data.userId) {
        alert('Registration successful! Please login.');
        navigation.navigate('Login');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error', error);
      if (error.response && error.response.data && error.response.data.message) {
        // Обработка ответа сервера с сообщением об ошибке (например, почта уже существует)
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during registration.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="Email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={register} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login here
      </Text>
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
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
