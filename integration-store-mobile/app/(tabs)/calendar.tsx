import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarEvents } from '@/hooks/useFirebaseData';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#ef4444'];

export default function CalendarScreen() {
          const colorScheme = useColorScheme();
          const isDark = colorScheme === 'dark';
          const { events, loading, saveEvents } = useCalendarEvents();
          const [currentDate, setCurrentDate] = useState(new Date());
          const [showAdd, setShowAdd] = useState(false);
          const [selectedDate, setSelectedDate] = useState<Date | null>(null);
          const [eventTitle, setEventTitle] = useState('');
          const [eventColor, setEventColor] = useState(COLORS[0]);

          const styles = StyleSheet.create({
                    container: {
                              flex: 1,
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                    },
                    header: {
                              padding: 24,
                              paddingTop: 16,
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                    },
                    title: {
                              fontSize: 28,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    nav: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                    },
                    navBtn: {
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    monthYear: {
                              fontSize: 16,
                              fontWeight: '600',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                              minWidth: 140,
                              textAlign: 'center',
                    },
                    calendarGrid: {
                              marginHorizontal: 20,
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderRadius: 16,
                              overflow: 'hidden',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    daysHeader: {
                              flexDirection: 'row',
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                              borderBottomWidth: 1,
                              borderBottomColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    dayHeader: {
                              flex: 1,
                              paddingVertical: 12,
                              alignItems: 'center',
                    },
                    dayHeaderText: {
                              fontSize: 12,
                              fontWeight: '600',
                              color: isDark ? '#6b7280' : '#9ca3af',
                              textTransform: 'uppercase',
                    },
                    weekRow: {
                              flexDirection: 'row',
                    },
                    dayCell: {
                              flex: 1,
                              minHeight: 70,
                              padding: 4,
                              borderRightWidth: 1,
                              borderBottomWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#f3f4f6',
                    },
                    dayCellLast: {
                              borderRightWidth: 0,
                    },
                    dayNumber: {
                              fontSize: 14,
                              fontWeight: '500',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                              marginBottom: 4,
                    },
                    dayNumberOther: {
                              color: isDark ? '#4b5563' : '#d1d5db',
                    },
                    dayNumberToday: {
                              backgroundColor: '#22c55e',
                              color: '#fff',
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              textAlign: 'center',
                              lineHeight: 26,
                              overflow: 'hidden',
                    },
                    eventPill: {
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                              marginBottom: 2,
                    },
                    eventText: {
                              fontSize: 10,
                              fontWeight: '600',
                              color: '#fff',
                    },
                    fab: {
                              position: 'absolute',
                              bottom: 24,
                              right: 24,
                              width: 56,
                              height: 56,
                              borderRadius: 28,
                              backgroundColor: '#22c55e',
                              alignItems: 'center',
                              justifyContent: 'center',
                              shadowColor: '#22c55e',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.3,
                              shadowRadius: 8,
                              elevation: 8,
                    },
                    modalOverlay: {
                              flex: 1,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              justifyContent: 'flex-end',
                    },
                    modalContent: {
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderTopLeftRadius: 24,
                              borderTopRightRadius: 24,
                              padding: 24,
                    },
                    modalTitle: {
                              fontSize: 18,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                              marginBottom: 16,
                    },
                    input: {
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 15,
                              color: isDark ? '#ffffff' : '#1e1e2d',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                              marginBottom: 16,
                    },
                    colorPicker: {
                              flexDirection: 'row',
                              gap: 10,
                              marginBottom: 16,
                    },
                    colorOption: {
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                    },
                    colorSelected: {
                              borderWidth: 3,
                              borderColor: isDark ? '#fff' : '#1e1e2d',
                    },
                    saveButton: {
                              backgroundColor: '#22c55e',
                              borderRadius: 12,
                              padding: 16,
                              alignItems: 'center',
                    },
                    saveButtonText: {
                              color: '#ffffff',
                              fontSize: 16,
                              fontWeight: '700',
                    },
                    loader: {
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                    },
          });

          // Calendar logic
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const getDaysInMonth = () => {
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const days: { date: Date; isCurrentMonth: boolean }[] = [];

                    // Previous month days
                    const startDay = firstDay.getDay();
                    const prevMonthDays = new Date(year, month, 0).getDate();
                    for (let i = startDay - 1; i >= 0; i--) {
                              days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
                    }

                    // Current month days
                    for (let i = 1; i <= lastDay.getDate(); i++) {
                              days.push({ date: new Date(year, month, i), isCurrentMonth: true });
                    }

                    // Next month days
                    const remaining = 42 - days.length;
                    for (let i = 1; i <= remaining; i++) {
                              days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
                    }

                    return days;
          };

          const formatDateKey = (date: Date) => {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          };

          const isToday = (date: Date) => {
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
          };

          const getEventsForDate = (date: Date) => {
                    const key = formatDateKey(date);
                    return events.filter((e: any) => e.date === key);
          };

          const goToPrev = () => setCurrentDate(new Date(year, month - 1));
          const goToNext = () => setCurrentDate(new Date(year, month + 1));

          const openAddModal = (date: Date) => {
                    setSelectedDate(date);
                    setShowAdd(true);
          };

          const addEvent = async () => {
                    if (!eventTitle.trim() || !selectedDate) return;

                    const newEvent = {
                              id: `evt-${Date.now()}`,
                              title: eventTitle.trim(),
                              date: formatDateKey(selectedDate),
                              color: eventColor,
                    };

                    await saveEvents([...events, newEvent]);
                    setEventTitle('');
                    setEventColor(COLORS[0]);
                    setShowAdd(false);
          };

          const days = getDaysInMonth();
          const weeks = [];
          for (let i = 0; i < days.length; i += 7) {
                    weeks.push(days.slice(i, i + 7));
          }

          if (loading) {
                    return (
                              <SafeAreaView style={styles.container}>
                                        <View style={styles.loader}>
                                                  <ActivityIndicator size="large" color="#22c55e" />
                                        </View>
                              </SafeAreaView>
                    );
          }

          return (
                    <SafeAreaView style={styles.container}>
                              {/* Header */}
                              <View style={styles.header}>
                                        <Text style={styles.title}>Calendar 📅</Text>
                                        <View style={styles.nav}>
                                                  <TouchableOpacity style={styles.navBtn} onPress={goToPrev}>
                                                            <Ionicons name="chevron-back" size={20} color={isDark ? '#fff' : '#1e1e2d'} />
                                                  </TouchableOpacity>
                                                  <Text style={styles.monthYear}>{MONTHS[month]} {year}</Text>
                                                  <TouchableOpacity style={styles.navBtn} onPress={goToNext}>
                                                            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#1e1e2d'} />
                                                  </TouchableOpacity>
                                        </View>
                              </View>

                              {/* Calendar Grid */}
                              <ScrollView>
                                        <View style={styles.calendarGrid}>
                                                  {/* Days Header */}
                                                  <View style={styles.daysHeader}>
                                                            {DAYS.map((day) => (
                                                                      <View key={day} style={styles.dayHeader}>
                                                                                <Text style={styles.dayHeaderText}>{day}</Text>
                                                                      </View>
                                                            ))}
                                                  </View>

                                                  {/* Weeks */}
                                                  {weeks.map((week, wIdx) => (
                                                            <View key={wIdx} style={styles.weekRow}>
                                                                      {week.map((day, dIdx) => {
                                                                                const dayEvents = getEventsForDate(day.date);
                                                                                return (
                                                                                          <TouchableOpacity
                                                                                                    key={dIdx}
                                                                                                    style={[styles.dayCell, dIdx === 6 && styles.dayCellLast]}
                                                                                                    onPress={() => openAddModal(day.date)}
                                                                                          >
                                                                                                    <Text
                                                                                                              style={[
                                                                                                                        styles.dayNumber,
                                                                                                                        !day.isCurrentMonth && styles.dayNumberOther,
                                                                                                                        isToday(day.date) && styles.dayNumberToday,
                                                                                                              ]}
                                                                                                    >
                                                                                                              {day.date.getDate()}
                                                                                                    </Text>
                                                                                                    {dayEvents.slice(0, 2).map((evt: any) => (
                                                                                                              <View key={evt.id} style={[styles.eventPill, { backgroundColor: evt.color }]}>
                                                                                                                        <Text style={styles.eventText} numberOfLines={1}>{evt.title}</Text>
                                                                                                              </View>
                                                                                                    ))}
                                                                                                    {dayEvents.length > 2 && (
                                                                                                              <Text style={{ fontSize: 10, color: isDark ? '#6b7280' : '#9ca3af' }}>
                                                                                                                        +{dayEvents.length - 2}
                                                                                                              </Text>
                                                                                                    )}
                                                                                          </TouchableOpacity>
                                                                                );
                                                                      })}
                                                            </View>
                                                  ))}
                                        </View>
                                        <View style={{ height: 100 }} />
                              </ScrollView>

                              {/* FAB */}
                              <TouchableOpacity style={styles.fab} onPress={() => openAddModal(new Date())}>
                                        <Ionicons name="add" size={28} color="#fff" />
                              </TouchableOpacity>

                              {/* Add Modal */}
                              <Modal visible={showAdd} transparent animationType="slide">
                                        <View style={styles.modalOverlay}>
                                                  <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAdd(false)} />
                                                  <View style={styles.modalContent}>
                                                            <Text style={styles.modalTitle}>
                                                                      New Event - {selectedDate?.toLocaleDateString()}
                                                            </Text>
                                                            <TextInput
                                                                      style={styles.input}
                                                                      placeholder="Event title"
                                                                      placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                                                      value={eventTitle}
                                                                      onChangeText={setEventTitle}
                                                            />
                                                            <View style={styles.colorPicker}>
                                                                      {COLORS.map((c) => (
                                                                                <TouchableOpacity
                                                                                          key={c}
                                                                                          style={[styles.colorOption, { backgroundColor: c }, eventColor === c && styles.colorSelected]}
                                                                                          onPress={() => setEventColor(c)}
                                                                                />
                                                                      ))}
                                                            </View>
                                                            <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
                                                                      <Text style={styles.saveButtonText}>Add Event</Text>
                                                            </TouchableOpacity>
                                                  </View>
                                        </View>
                              </Modal>
                    </SafeAreaView>
          );
}
