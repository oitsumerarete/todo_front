import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import OriginalTaskCard from './common/OriginalTaskCard';
import API_URL from '../config';

const { width } = Dimensions.get('window');

const PlanStoreScreen = ({ route }) => {
  const { planId } = route.params;
  const swiper = useRef();
  const [currentDay, setCurrentDay] = useState(0); // Tracks the selected day index (e.g., first day is 0)
  console.log('currentDay', currentDay)
  const [currentDayTasks, setCurrentDayTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // Keeps track of how many weeks we've scrolled

  const changeDayTasks = (dayIndex) => {
    setCurrentDay(dayIndex);
    setCurrentDayTasks(tasks.filter((task) => task.dayNumber === dayIndex + 1))
  }
  // Helper function to convert a number to an ordinal (1st, 2nd, 3rd, etc.)
  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const renderTaskItem = ({ item }) => <OriginalTaskCard task={item} />;

  // Calculate the days to display (7 days per swipe) based on weekOffset
  const days = React.useMemo(() => {
    return [-1, 0, 1].map(adj => {
      return Array.from({ length: 7 }).map((_, index) => {
        const dayIndex = (weekOffset + adj) * 7 + index;
        return {
          label: `${ordinal(dayIndex + 1)} day`, // Convert dayIndex to "First day", "Second day", etc.
          dayIndex,
        };
      });
    });
  }, [weekOffset]);

  const getBearerToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  }, []);

  // Fetch plans from the API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      const response = await axios.get(`${API_URL}/original/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(response.data.tasks);
      setCurrentDayTasks(response.data.tasks.filter((task) => task.dayNumber === currentDay + 1))
    } catch (err) {
      console.log(err)
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, [getBearerToken, planId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={ind => {
              if (ind === 1) {
                return; // Do nothing if it's the middle swiper (current week)
              }
              setTimeout(() => {
                const newIndex = ind - 1;
                setWeekOffset(weekOffset + newIndex); // Move to previous/next week
                swiper.current.scrollTo(1, false); // Reset swiper to the middle view
              }, 100);
            }}>
            {days.map((daySet, index) => (
              <View style={styles.itemRow} key={index}>
                {daySet.map((item, dateIndex) => {
                  const isActive = currentDay === item.dayIndex;
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => changeDayTasks(item.dayIndex)}>
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#111',
                            borderColor: '#111',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: '#fff' },
                          ]}>
                          {item.label}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={styles.subtitle}>{ordinal(currentDay + 1)} day</Text>
          <View style={styles.container}>
              <FlatList
                data={currentDayTasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item.taskId.toString()}
              />
            </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Start now!</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
  /** Item */
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4,
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 9,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PlanStoreScreen;
