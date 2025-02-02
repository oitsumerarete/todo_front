import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import SettingsScreen from './screens/HomeScreen/SettingsScreen';
import UsersPlanScreen from './screens/UsersPlanScreen/UsersPlanScreen';
import OriginalPlansStoreScreen from './screens/OriginalPlansStoreScreen';
import PlanStoreScreen from './screens/PlanStoreScreen';
import PlanCreationScreen from './screens/PlanCreation/PlanCreationScreen';
import PlanInfoScreen from './screens/PlanCreation/PlanInfoScreen';
import TaskCreationScreen from './screens/PlanCreation/TaskCreationScreen';
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

LocaleConfig.defaultLocale = 'ru';

const InvertedTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#ffffff',
    card: '#ffffff',
    text: '#76182a',
    border: '#ffffff',
    notification: '#ffffff',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#76182a',
        tabBarInactiveTintColor: '#d1a3a3',
        tabBarStyle: { backgroundColor: '#ffffff' },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#76182a',
      }}
    >
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
    <NavigationContainer theme={InvertedTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#76182a',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Настройки" component={SettingsScreen} />
        <Stack.Screen name="Страница плана" component={PlanStoreScreen} />
        <Stack.Screen name="Поиск" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PlanCreationScreen" component={PlanCreationScreen} />
        <Stack.Screen name="PlanInfo" component={PlanInfoScreen} options={{ title: 'Создание плана' }} />
        <Stack.Screen name="TaskCreation" component={TaskCreationScreen} options={{ title: 'Создание задач' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}