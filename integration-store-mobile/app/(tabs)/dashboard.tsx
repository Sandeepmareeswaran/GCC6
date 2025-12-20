import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFirebaseUser, useTodos, useNotes, useCalendarEvents } from '@/hooks/useFirebaseData';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DashboardScreen() {
          const colorScheme = useColorScheme();
          const isDark = colorScheme === 'dark';
          const router = useRouter();
          const { email, isSignedIn } = useFirebaseUser();
          const { todos, loading: todosLoading } = useTodos();
          const { notes, loading: notesLoading } = useNotes();
          const { events, loading: eventsLoading } = useCalendarEvents();

          // Count total tasks
          const totalTasks = todos.reduce((acc: number, col: any) => {
                    return acc + (col.items?.length || 0);
          }, 0);

          const totalNotes = notes.length;
          const totalEvents = events.length;
          const isLoading = todosLoading || notesLoading || eventsLoading;

          const styles = StyleSheet.create({
                    container: {
                              flex: 1,
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                    },
                    header: {
                              padding: 24,
                              paddingTop: 16,
                    },
                    greeting: {
                              fontSize: 14,
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginBottom: 4,
                    },
                    title: {
                              fontSize: 28,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    email: {
                              fontSize: 13,
                              color: '#22c55e',
                              marginTop: 4,
                    },
                    statsGrid: {
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              paddingHorizontal: 16,
                              gap: 12,
                    },
                    statCard: {
                              flex: 1,
                              minWidth: '45%',
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderRadius: 16,
                              padding: 20,
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    statIcon: {
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 12,
                    },
                    statValue: {
                              fontSize: 28,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    statLabel: {
                              fontSize: 13,
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginTop: 2,
                    },
                    section: {
                              paddingHorizontal: 20,
                              marginTop: 28,
                    },
                    sectionTitle: {
                              fontSize: 18,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                              marginBottom: 16,
                    },
                    quickAction: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderRadius: 14,
                              padding: 16,
                              marginBottom: 10,
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    quickActionIcon: {
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 14,
                    },
                    quickActionText: {
                              fontSize: 15,
                              fontWeight: '600',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    quickActionSub: {
                              fontSize: 12,
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginTop: 2,
                    },
                    loader: {
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                    },
          });

          if (isLoading) {
                    return (
                              <SafeAreaView style={styles.container}>
                                        <View style={styles.loader}>
                                                  <ActivityIndicator size="large" color="#22c55e" />
                                                  <Text style={{ color: isDark ? '#fff' : '#1e1e2d', marginTop: 12 }}>Loading...</Text>
                                        </View>
                              </SafeAreaView>
                    );
          }

          return (
                    <SafeAreaView style={styles.container}>
                              <ScrollView showsVerticalScrollIndicator={false}>
                                        {/* Header */}
                                        <View style={styles.header}>
                                                  <Text style={styles.greeting}>Welcome back 👋</Text>
                                                  <Text style={styles.title}>Dashboard</Text>
                                                  {isSignedIn && <Text style={styles.email}>{email}</Text>}
                                        </View>

                                        {/* Stats Grid */}
                                        <View style={styles.statsGrid}>
                                                  <View style={styles.statCard}>
                                                            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                                                                      <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                                            </View>
                                                            <Text style={styles.statValue}>{totalTasks}</Text>
                                                            <Text style={styles.statLabel}>Total Tasks</Text>
                                                  </View>

                                                  <View style={styles.statCard}>
                                                            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                                                                      <Ionicons name="document-text" size={24} color="#f97316" />
                                                            </View>
                                                            <Text style={styles.statValue}>{totalNotes}</Text>
                                                            <Text style={styles.statLabel}>Notes</Text>
                                                  </View>

                                                  <View style={styles.statCard}>
                                                            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                                                                      <Ionicons name="calendar" size={24} color="#3b82f6" />
                                                            </View>
                                                            <Text style={styles.statValue}>{totalEvents}</Text>
                                                            <Text style={styles.statLabel}>Events</Text>
                                                  </View>

                                                  <View style={styles.statCard}>
                                                            <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
                                                                      <Ionicons name="sync" size={24} color="#8b5cf6" />
                                                            </View>
                                                            <Text style={styles.statValue}>Synced</Text>
                                                            <Text style={styles.statLabel}>Real-time</Text>
                                                  </View>
                                        </View>

                                        {/* Quick Actions */}
                                        <View style={styles.section}>
                                                  <Text style={styles.sectionTitle}>Quick Actions</Text>

                                                  <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/todo')}>
                                                            <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
                                                                      <Ionicons name="add" size={22} color="#22c55e" />
                                                            </View>
                                                            <View>
                                                                      <Text style={styles.quickActionText}>Add New Task</Text>
                                                                      <Text style={styles.quickActionSub}>Create a task in your to-do list</Text>
                                                            </View>
                                                  </TouchableOpacity>

                                                  <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/notes')}>
                                                            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                                                                      <Ionicons name="create" size={22} color="#f97316" />
                                                            </View>
                                                            <View>
                                                                      <Text style={styles.quickActionText}>Write a Note</Text>
                                                                      <Text style={styles.quickActionSub}>Capture your thoughts quickly</Text>
                                                            </View>
                                                  </TouchableOpacity>

                                                  <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/calendar')}>
                                                            <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
                                                                      <Ionicons name="time" size={22} color="#3b82f6" />
                                                            </View>
                                                            <View>
                                                                      <Text style={styles.quickActionText}>Schedule Event</Text>
                                                                      <Text style={styles.quickActionSub}>Add an event to your calendar</Text>
                                                            </View>
                                                  </TouchableOpacity>
                                        </View>

                                        <View style={{ height: 40 }} />
                              </ScrollView>
                    </SafeAreaView>
          );
}
