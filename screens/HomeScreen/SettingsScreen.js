import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '../../config';
import * as ImageManipulator from 'expo-image-manipulator';

const privacyPolicyText = `
Политика конфиденциальности

Последнее обновление: 01.02.2025

1. Введение
Добро пожаловать в приложение «Дельтаплан»!
Настоящая Политика конфиденциальности описывает, как мы (далее — «Компания», «мы», «наш») собираем, используем, храним и раскрываем информацию, получаемую от пользователей (далее — «Пользователь», «вы») нашего мобильного приложения «Дельтаплан» (далее — «Приложение»). Используя Приложение, вы соглашаетесь с условиями данной Политики конфиденциальности. Если вы не согласны с её положениями, пожалуйста, не используйте Приложение.

2. Сбор информации

2.1. Персональная информация, предоставляемая вами  
При регистрации, создании профиля, создании собственных планов, участии в голосованиях, публикации комментариев и использовании других функций Приложения вы можете предоставить нам следующую информацию:  
- Имя, фамилия, никнейм;  
- Адрес электронной почты;  
- Фотография профиля;  
- Контактные данные (при наличии и добровольном предоставлении);  
- Другая информация, которую вы решите предоставить.

2.2. Неперсональная информация  
Автоматически собирается информация о вашем устройстве и об использовании Приложения:  
- Модель устройства, версия операционной системы, уникальный идентификатор устройства;  
- Журналы событий, IP-адрес, данные об ошибках и сбоях;  
- Статистика использования Приложения (например, какие функции используются, время работы, действия внутри приложения).

2.3. Техническая информация для уведомлений  
Для корректной работы push-уведомлений (о пропущенных ивентах, обновлениях, напоминаниях) может быть собрана информация, необходимая для идентификации вашего устройства (например, токен устройства), которая используется исключительно для отправки уведомлений.

3. Использование информации

Собранная информация используется для следующих целей:  
- **Предоставление услуг:** обеспечение работы функций Приложения, таких как создание и кастомизация планов, система голосования, публикация комментариев, отслеживание порядка дня, ведение статистики по рациону, подсчет БЖУ и калорий.  
- **Улучшение работы Приложения:** анализ статистики использования для оптимизации функциональности, выявления и устранения ошибок, повышения качества работы.  
- **Персонализация:** адаптация контента и рекомендаций в зависимости от ваших интересов и предпочтений.  
- **Коммуникация с пользователем:** отправка push-уведомлений, информационных сообщений, напоминаний (например, о пропущенных задачах или ивентах), а также ответы на ваши запросы и обращения в службу поддержки.  
- **Безопасность:** защита от мошеннических действий, соблюдение юридических обязательств, расследование нарушений Правил использования.

4. Передача и раскрытие информации

Мы не продаем, не обмениваем и не распространяем вашу персональную информацию третьим лицам без вашего согласия, за исключением следующих случаев:  
- **Поставщики услуг:** для обеспечения работы Приложения мы можем привлекать сторонние компании (например, провайдеры аналитики, сервисы рассылок, облачное хранение данных). Эти стороны имеют доступ к вашим данным только в объеме, необходимом для выполнения своих задач, и обязаны соблюдать конфиденциальность.  
- **Юридические обязательства:** если этого требует закон, судебное решение или запрос государственных органов, мы можем передать вашу информацию в установленном законом порядке.  
- **Передача в рамках бизнеса:** в случае реорганизации, слияния, продажи бизнеса или иного изменения структуры компании, ваша информация может быть передана новому владельцу, при условии сохранения условий настоящей Политики конфиденциальности.

5. Хранение и защита информации

- **Хранение:** мы храним вашу информацию до тех пор, пока она необходима для достижения целей, описанных в данной Политике, или до тех пор, пока не будет отозвано ваше согласие на её обработку.  
- **Безопасность:** мы предпринимаем соответствующие технические и организационные меры для защиты ваших данных от несанкционированного доступа, утраты, изменения или раскрытия. Однако ни одна система безопасности не может обеспечить абсолютную защиту, поэтому мы не можем гарантировать полную безопасность передаваемых вами данных.

6. Файлы cookies и аналогичные технологии

Приложение может использовать файлы cookies и другие технологии для:  
- Улучшения работы Приложения и персонализации пользовательского опыта;  
- Сбора статистики об использовании Приложения;  
- Анализа взаимодействия с различными функциями Приложения.  
Вы можете настроить параметры вашего устройства или браузера таким образом, чтобы отклонять файлы cookies, однако это может повлиять на функциональность Приложения.

7. Ссылки на сторонние ресурсы

Приложение может содержать ссылки на сторонние веб-сайты или сервисы, которые не находятся под контролем Компании. Мы не несем ответственности за политику конфиденциальности или содержание этих ресурсов. Рекомендуем ознакомиться с политикой конфиденциальности соответствующих сайтов перед предоставлением им каких-либо персональных данных.

8. Права Пользователя

В соответствии с действующим законодательством, вы имеете следующие права:  
- Право на доступ к своим персональным данным, которые мы обрабатываем;  
- Право на исправление или удаление ваших данных, если они неверны или устарели;  
- Право на ограничение обработки или возражение против обработки ваших данных в определенных случаях;  
- Право получить копию ваших данных в машиночитаемом формате;  
- Право отозвать свое согласие на обработку персональных данных (обратите внимание, что это может повлечь ограничение функциональности Приложения).  

Для реализации своих прав, пожалуйста, свяжитесь с нами, используя контактную информацию, указанную ниже.

9. Изменения в Политике конфиденциальности

Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности в любое время. Все изменения вступают в силу с момента их публикации в Приложении. Рекомендуем регулярно просматривать данную Политику, чтобы быть в курсе обновлений.

10. Контактная информация

Если у вас возникли вопросы, предложения или замечания по поводу настоящей Политики конфиденциальности, пожалуйста, свяжитесь с нами по следующим каналам:  
- Электронная почта: info.deltaplan@inbox.ru
- Telegram: @deltaplaninfo

11. Согласие с Политикой конфиденциальности

Используя Приложение «Дельтаплан», вы подтверждаете, что ознакомлены с данной Политикой конфиденциальности и соглашаетесь с её условиями. Если вы не согласны с условиями настоящей Политики, пожалуйста, прекратите использование Приложения.
`;

const SettingsScreen = () => {
  // Состояния для профиля
  const [isPrivacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [isEditingName, setEditingName] = useState(false);
  const [isEditingEmail, setEditingEmail] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isNewUsernameAllowed, setIsNewUsernameAllowed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Состояния для формы обратной связи
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const openDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
  };

  const handleNameChange = async (newName) => {
    setName(newName);
    await checkUsernameExists(newName);
  };

  const checkUsernameExists = useCallback(
    async (newName) => {
      try {
        const token = await getBearerToken();
        const response = await axios.post(
          `${API_URL}/user/check/username`,
          { newName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Если response.data === true, значит никнейм занят
        setIsNewUsernameAllowed(!response.data);
      } catch (err) {
        console.log(err);
      }
    },
    [getBearerToken]
  );

  const closePrivacyPolicy = () => {
    setPrivacyPolicyVisible(false);
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
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
    closeDeleteModal();
    try {
      const token = await getBearerToken();
      // Пример запроса на удаление аккаунта:
      // const response = await axios.get(`${API_URL}/user/delete`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // console.log(response);
    } catch (err) {
      console.log(err);
    }
  }, [getBearerToken]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/user/base/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedImage(response.data.user.avatar);
      setEmail(response.data.user.email);
      setName(response.data.user.username);
    } catch (err) {
      console.log(err);
    }
  }, [getBearerToken]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  // Функция сохранения изменений в профиле
  const handleSaveData = async () => {
    if (name.trim() === '' || email.trim() === '') {
      Alert.alert('Ошибка', 'Никнейм и почта не могут быть пустыми');
      return;
    }
    if (!isNewUsernameAllowed) {
      Alert.alert('Ошибка', 'Такой никнейм уже занят. Введите другой никнейм.');
      return;
    }
  
    setIsSaving(true);
    try {
      const token = await getBearerToken();
  
      const formData = new FormData();
      formData.append('username', name);
      formData.append('email', email);
  
      if (selectedImage) {
        // Сжатие изображения перед отправкой
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          selectedImage,
          [{ resize: { width: 800 } }], // Уменьшение до 800 пикселей в ширину (авто высота)
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Сжатие и конвертация в JPEG
        );
  
        const filename = manipulatedImage.uri.split('/').pop();
        formData.append('avatar', {
          uri: manipulatedImage.uri,
          name: filename,
          type: 'image/jpeg',
        });
      }
  
      const response = await axios.put(`${API_URL}/user/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('Данные обновлены', response.data);
      Alert.alert('Успех', 'Данные успешно сохранены');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    } finally {
      setIsSaving(false);
    }
  };

  // Функция отправки отзыва
  const handleSubmitFeedback = async () => {
    if (feedback.trim() === '') {
      Alert.alert('Ошибка', 'Отзыв не может быть пустым');
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const token = await getBearerToken();
      const response = await axios.post(
        `${API_URL}/feedback`,
        { feedback },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Спасибо', 'Ваш отзыв отправлен!');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Ошибка', 'Не удалось отправить отзыв');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const isSaveButtonDisabled =
    !isNewUsernameAllowed ||
    isSaving ||
    name.trim() === '' ||
    email.trim() === '';

  return (
    <View style={styles.container}>
      {/* Блок профиля */}
      <View style={styles.profileContainer}>
        {selectedImage && (
          <TouchableOpacity onPress={handleSelectImage}>
            <View style={{ alignItems: 'center' }}>
              <Image style={styles.avatar} source={{ uri: selectedImage }} />
              <Text style={styles.editText}>Редактировать</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Никнейм */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, isEditingName && styles.editableInput]}
            value={name}
            autoCapitalize="none"
            onChangeText={handleNameChange}
            editable={isEditingName}
          />
          <TouchableOpacity
            style={{ paddingLeft: 10 }}
            onPress={() => setEditingName(!isEditingName)}
          >
            <Ionicons
              name={isEditingName ? 'checkmark' : 'pencil'}
              size={20}
              color="#007bff"
            />
          </TouchableOpacity>
        </View>
        {!isNewUsernameAllowed && (
          <Text style={styles.errorText}>Такой никнейм уже занят</Text>
        )}

        {/* Email */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, isEditingEmail && styles.editableInput]}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={isEditingEmail}
          />
          <TouchableOpacity
            style={{ paddingLeft: 10 }}
            onPress={() => setEditingEmail(!isEditingEmail)}
          >
            <Ionicons
              name={isEditingEmail ? 'checkmark' : 'pencil'}
              size={20}
              color="#007bff"
            />
          </TouchableOpacity>
        </View>

        {/* Кнопка сохранения профиля */}
        <TouchableOpacity
          style={[
            styles.saveButtonFirst,
            isSaveButtonDisabled && { opacity: 0.5 },
          ]}
          onPress={handleSaveData}
          disabled={isSaveButtonDisabled}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Дополнительные опции */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setPrivacyPolicyVisible(true)}
        >
          <Text style={styles.optionText}>Политика конфиденциальности</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButtonFirst}
          onPress={openDeleteModal}
        >
          <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
        </TouchableOpacity>
      </View>

      {/* Форма обратной связи */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Обратная связь</Text>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Расскажите, что вам не нравится или что можно улучшить..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            isSubmittingFeedback && { opacity: 0.5 },
          ]}
          onPress={handleSubmitFeedback}
          disabled={isSubmittingFeedback}
        >
          <Text style={styles.feedbackButtonText}>
            {isSubmittingFeedback ? 'Отправка...' : 'Отправить отзыв'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Модальное окно политики конфиденциальности */}
      <Modal
        visible={isPrivacyPolicyVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePrivacyPolicy}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Политика конфиденциальности</Text>
            <ScrollView style={styles.scrollContainer}>
              <Text style={styles.modalText}>{privacyPolicyText}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closePrivacyPolicy}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно удаления аккаунта */}
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
              Вы точно хотите{' '}
              <Text style={{ fontWeight: 'bold' }}>удалить</Text> аккаунт?
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
  },
  saveButtonFirst: {
    backgroundColor: '#007bff',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
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
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  scrollContainer: {
    marginBottom: 20,
  },
  modalHeader: {
    fontSize: 22,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
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
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  feedbackContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  feedbackInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  feedbackButton: {
    backgroundColor: '#28a745',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
