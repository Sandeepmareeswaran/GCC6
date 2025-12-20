import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTodos } from '@/hooks/useFirebaseData';
import { useColorScheme } from '@/hooks/use-color-scheme';

const COLUMNS = [
          { key: 'today', title: 'Today', color: '#22c55e' },
          { key: 'tomorrow', title: 'Tomorrow', color: '#3b82f6' },
          { key: 'done', title: 'Done', color: '#9ca3af' },
];

export default function TodoScreen() {
          const colorScheme = useColorScheme();
          const isDark = colorScheme === 'dark';
          const { todos, loading, saveTodos } = useTodos();
          const [activeColumn, setActiveColumn] = useState('today');
          const [showAdd, setShowAdd] = useState(false);
          const [newTask, setNewTask] = useState('');

          const styles = StyleSheet.create({
                    container: {
                              flex: 1,
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                    },
                    header: {
                              padding: 24,
                              paddingTop: 16,
                    },
                    title: {
                              fontSize: 28,
                              fontWeight: '700',
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    subtitle: {
                              fontSize: 14,
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginTop: 4,
                    },
                    tabs: {
                              flexDirection: 'row',
                              paddingHorizontal: 20,
                              marginBottom: 16,
                              gap: 10,
                    },
                    tab: {
                              paddingVertical: 10,
                              paddingHorizontal: 18,
                              borderRadius: 10,
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    tabActive: {
                              backgroundColor: '#22c55e',
                              borderColor: '#22c55e',
                    },
                    tabText: {
                              fontSize: 14,
                              fontWeight: '600',
                              color: isDark ? '#9ca3af' : '#6b7280',
                    },
                    tabTextActive: {
                              color: '#ffffff',
                    },
                    taskList: {
                              paddingHorizontal: 20,
                    },
                    taskItem: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: isDark ? '#1e1e2d' : '#ffffff',
                              borderRadius: 14,
                              padding: 16,
                              marginBottom: 10,
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    checkbox: {
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              borderWidth: 2,
                              borderColor: '#22c55e',
                              marginRight: 14,
                              alignItems: 'center',
                              justifyContent: 'center',
                    },
                    checkboxDone: {
                              backgroundColor: '#22c55e',
                    },
                    taskText: {
                              flex: 1,
                              fontSize: 15,
                              color: isDark ? '#ffffff' : '#1e1e2d',
                    },
                    taskTextDone: {
                              textDecorationLine: 'line-through',
                              color: isDark ? '#6b7280' : '#9ca3af',
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
                    empty: {
                              alignItems: 'center',
                              paddingVertical: 40,
                    },
                    emptyText: {
                              color: isDark ? '#6b7280' : '#9ca3af',
                              marginTop: 12,
                              fontSize: 15,
                    },
                    loader: {
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                    },
          });

          // Get current column data
          const currentColumn = todos.find((c: any) => c.key === activeColumn) || { items: [] };
          const tasks = currentColumn.items || [];

          const addTask = async () => {
                    if (!newTask.trim()) return;

                    const newItem = {
                              id: Date.now().toString(),
                              title: newTask.trim(),
                              status: 'pending',
                              date: new Date().toISOString().split('T')[0],
                    };

                    let updatedTodos = [...todos];
                    const colIndex = updatedTodos.findIndex((c: any) => c.key === activeColumn);

                    if (colIndex >= 0) {
                              updatedTodos[colIndex].items = [...(updatedTodos[colIndex].items || []), newItem];
                    } else {
                              updatedTodos.push({ key: activeColumn, title: COLUMNS.find(c => c.key === activeColumn)?.title, items: [newItem] });
                    }

                    await saveTodos(updatedTodos);
                    setNewTask('');
                    setShowAdd(false);
          };

          const toggleTask = async (taskId: string) => {
                    let updatedTodos = todos.map((col: any) => {
                              if (col.key === activeColumn) {
                                        return {
                                                  ...col,
                                                  items: col.items.map((item: any) =>
                                                            item.id === taskId
                                                                      ? { ...item, status: item.status === 'done' ? 'pending' : 'done' }
                                                                      : item
                                                  ),
                                        };
                              }
                              return col;
                    });
                    await saveTodos(updatedTodos);
          };

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
                                        <Text style={styles.title}>To-Do ✅</Text>
                                        <Text style={styles.subtitle}>Manage your tasks</Text>
                              </View>

                              {/* Column Tabs */}
                              <View style={styles.tabs}>
                                        {COLUMNS.map((col) => (
                                                  <TouchableOpacity
                                                            key={col.key}
                                                            style={[styles.tab, activeColumn === col.key && styles.tabActive]}
                                                            onPress={() => setActiveColumn(col.key)}
                                                  >
                                                            <Text style={[styles.tabText, activeColumn === col.key && styles.tabTextActive]}>
                                                                      {col.title}
                                                            </Text>
                                                  </TouchableOpacity>
                                        ))}
                              </View>

                              {/* Task List */}
                              <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
                                        {tasks.length === 0 ? (
                                                  <View style={styles.empty}>
                                                            <Ionicons name="clipboard-outline" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                                                            <Text style={styles.emptyText}>No tasks yet</Text>
                                                  </View>
                                        ) : (
                                                  tasks.map((task: any) => (
                                                            <TouchableOpacity
                                                                      key={task.id}
                                                                      style={styles.taskItem}
                                                                      onPress={() => toggleTask(task.id)}
                                                            >
                                                                      <View style={[styles.checkbox, task.status === 'done' && styles.checkboxDone]}>
                                                                                {task.status === 'done' && <Ionicons name="checkmark" size={16} color="#fff" />}
                                                                      </View>
                                                                      <Text style={[styles.taskText, task.status === 'done' && styles.taskTextDone]}>
                                                                                {task.title}
                                                                      </Text>
                                                            </TouchableOpacity>
                                                  ))
                                        )}
                                        <View style={{ height: 100 }} />
                              </ScrollView>

                              {/* FAB */}
                              <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
                                        <Ionicons name="add" size={28} color="#fff" />
                              </TouchableOpacity>

                              {/* Add Modal */}
                              <Modal visible={showAdd} transparent animationType="slide">
                                        <View style={styles.modalOverlay}>
                                                  <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAdd(false)} />
                                                  <View style={styles.modalContent}>
                                                            <Text style={styles.modalTitle}>Add New Task</Text>
                                                            <TextInput
                                                                      style={styles.input}
                                                                      placeholder="What needs to be done?"
                                                                      placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                                                      value={newTask}
                                                                      onChangeText={setNewTask}
                                                                      autoFocus
                                                            />
                                                            <TouchableOpacity style={styles.saveButton} onPress={addTask}>
                                                                      <Text style={styles.saveButtonText}>Add Task</Text>
                                                            </TouchableOpacity>
                                                  </View>
                                        </View>
                              </Modal>
                    </SafeAreaView>
          );
}
