import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import AuthStack from './navigation/AuthStack';
import RegisterScreen from './screens/RegisterScreen';
import UsersPlanScreen from './screens/UsersPlanScreen/UsersPlanScreen';
import OriginalPlansStoreScreen from './screens/OriginalPlansStoreScreen';
import PlanStoreScreen from './screens/PlanStoreScreen';
import PlanCreationScreen from './screens/PlanCreation/PlanCreationScreen';
import { LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],
  monthNamesShort: ['Янв.', 'Февр.', 'Март', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'],
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня'
};

// Применяем настройки русского языка
LocaleConfig.defaultLocale = 'ru';

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Профиль"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Мой план"
        component={UsersPlanScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Поиск планов"
        component={OriginalPlansStoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Tab.Screen name="PlanStoreScreen" component={PlanStoreScreen} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PlanCreationScreen" component={PlanCreationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 