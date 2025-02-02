// screens/PlanInfoScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, SafeAreaView, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

// Пример доступных тегов для плана
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

const PlanInfoScreen = ({ navigation }) => {
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    tag: '',
    image: null,
  });

  const handlePlanInputChange = (field, value) => {
    setNewPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Необходимо разрешение для доступа к галерее!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setNewPlan((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleNext = () => {
    // Можно добавить валидацию полей плана
    navigation.navigate('TaskCreation', { plan: newPlan });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Название плана</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите название плана"
          value={newPlan.title}
          onChangeText={(text) => handlePlanInputChange('title', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Описание плана</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Введите описание плана"
          multiline
          numberOfLines={4}
          value={newPlan.description}
          onChangeText={(text) => handlePlanInputChange('description', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Тег плана</Text>
        <FlatList
          data={availableTags}
          horizontal
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tag,
                { backgroundColor: item.color },
                newPlan.tag === item.label && styles.selectedTag,
              ]}
              onPress={() => {
                // Если текущий выбранный тег совпадает с нажатым, сбрасываем его,
                // иначе устанавливаем выбранный тег
                if (newPlan.tag === item.label) {
                  handlePlanInputChange('tag', '');
                } else {
                  handlePlanInputChange('tag', item.label);
                }
              }}
            >
              <Text style={[newPlan.tag === item.label && styles.selectedTagText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.fieldContainer}>
        <TouchableOpacity style={styles.btn} onPress={handleSelectImage}>
          <Text style={styles.btnText}>Выбрать изображение</Text>
        </TouchableOpacity>

        {newPlan.image && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={styles.label}>Предпросмотр:</Text>
              <Image source={{ uri: newPlan.image }} style={{ width: 100, height: 100, borderRadius: 8 }} />
            </View>
          )}
      </View>

      <View style={styles.footer}>
        <Button mode="contained" onPress={handleNext} disabled={!newPlan.title.trim()}>
          Перейти к созданию задач
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tag: {
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  selectedTag: {
    borderWidth: 2,
    borderColor: '#76182a',
  },
  selectedTagText: {
    fontWeight: 'bold',
    color: '#76182a',
  },
  btn: {
    backgroundColor: '#76182a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});

export default PlanInfoScreen;
