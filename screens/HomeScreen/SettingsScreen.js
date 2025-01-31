import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({userEmail, userAvatar, userLogin,  }) => {
  const [isPrivacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [name, setName] = useState('Yaroslav Ovsyannikov');
  const [email, setEmail] = useState('26sfqhyrv@privaterelay.appleid.com');
  const [selectedImage, setSelectedImage] = useState(userAvatar);
  const [isEditingName, setEditingName] = useState(false);
  const [isEditingEmail, setEditingEmail] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const openDeleteModal = () => {
    setDeleteModalVisible(true);
  };
  
  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
  };

  const closePrivacyPolicy = () => {
    setPrivacyPolicyVisible(false);
  };

  const handleSelectImage = async () => {
    // Запрашиваем разрешения
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Необходимо разрешение для доступа к галерее!');
      return;
    }

    // Открываем галерею
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Сохраняем URI выбранного изображения
    }
  };

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    closeDeleteModal(); // Закрываем модальное окно перед удалением
    try {
      const token = await getBearerToken();
      // const response = await axios.get(`${API_URL}/user/delete`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // console.log(response);
    } catch (err) {
      console.log(err)
    }
  }, [getBearerToken]);

  return (
    <View style={styles.container}>
      {/* Avatar and Name */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleSelectImage}>
          <View style={{ alignItems: 'center' }}>
            <Image
              style={styles.avatar}
              source={{
                uri: selectedImage,
              }}
            />
            <TouchableOpacity>
              <Text style={styles.editText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        

        {/* Name Section */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, isEditingName && styles.editableInput]}
            value={name}
            onChangeText={setName}
            editable={isEditingName}
          />
          <TouchableOpacity style={{paddingLeft: 10}} onPress={() => setEditingName(!isEditingName)}>
            <Ionicons name={isEditingName ? "checkmark" : "pencil"} size={20} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Email Section */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, isEditingEmail && styles.editableInput]}
            value={email}
            onChangeText={setEmail}
            editable={isEditingEmail}
          />
          <TouchableOpacity style={{paddingLeft: 10}} onPress={() => setEditingEmail(!isEditingEmail)}>
            <Ionicons name={isEditingEmail ? "checkmark" : "pencil"} size={20} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setPrivacyPolicyVisible(true)}
        >
          <Text style={styles.optionText}>Политика конфиденциальности</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButtonFirst} onPress={openDeleteModal}>
          <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Policy Modal */}
      <Modal
        visible={isPrivacyPolicyVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePrivacyPolicy}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Privacy Policy</Text>
            <Text style={styles.modalText}>
              [Full privacy policy content here...]
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closePrivacyPolicy}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
  visible={isDeleteModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={closeDeleteModal}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Удаление аккаунта</Text>
      <Text style={styles.modalText}>
        Вы точно хотите 
        <Text style={{
          fontWeight: 'bold'}}> удалить </Text> 
        аккаунт?
      </Text>
      <View style={styles.modalButtonsContainer}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={closeDeleteModal}
        >
          <Text style={styles.modalButtonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.modalButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#000',
  },
  deleteButtonFirst: {
    backgroundColor: '#ff4d4d',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  profileContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  editText: {
    color: '#007bff',
    fontSize: 14,
    marginVertical: 5,
  },
  input: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  editableInput: {
    borderColor: '#007bff',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  optionsContainer: {
    marginTop: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    fontSize: 22,
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
});

export default SettingsScreen;
