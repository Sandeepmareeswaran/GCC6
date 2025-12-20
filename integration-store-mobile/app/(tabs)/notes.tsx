import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Categories matching web
const CATEGORIES = [
          { id: 'personal', label: 'Personal', icon: '👤', color: '#3b82f6' },
          { id: 'work', label: 'Work', icon: '💼', color: '#f97316' },
          { id: 'ideas', label: 'Ideas', icon: '💡', color: '#8b5cf6' },
          { id: 'important', label: 'Important', icon: '⭐', color: '#eab308' },
          { id: 'history', label: 'History', icon: '📚', color: '#6b7280' },
];

// Priorities matching web
const PRIORITIES = [
          { id: 'high', label: 'High', color: '#f94144' },
          { id: 'medium', label: 'Medium', color: '#f8961e' },
          { id: 'low', label: 'Low', color: '#4cc9f0' },
];

export default function NotesScreen() {
          const colorScheme = useColorScheme();
          const isDark = colorScheme === 'dark';
          const { user, isLoaded } = useUser();

          const [notes, setNotes] = useState<any[]>([]);
          const [loading, setLoading] = useState(true);
          const [showAdd, setShowAdd] = useState(false);
          const [noteText, setNoteText] = useState('');
          const [noteCategory, setNoteCategory] = useState('personal');
          const [notePriority, setNotePriority] = useState('medium');
          const [filter, setFilter] = useState('all');
          const [search, setSearch] = useState('');

          const email = user?.primaryEmailAddress?.emailAddress || 'guest';

          // Load notes from Firebase
          useEffect(() => {
                    if (!isLoaded || email === 'guest') {
                              setLoading(false);
                              return;
                    }

                    const docRef = doc(db, 'Gccusernotes', email);
                    const unsubscribe = onSnapshot(docRef, (snapshot) => {
                              if (snapshot.exists()) {
                                        const data = snapshot.data();
                                        setNotes(data.notes || []);
                              } else {
                                        setNotes([]);
                              }
                              setLoading(false);
                    });

                    return () => unsubscribe();
          }, [email, isLoaded]);

          // Save notes to Firebase
          const saveNotes = async (notesList: any[]) => {
                    if (email === 'guest') return;
                    const docRef = doc(db, 'Gccusernotes', email);
                    await setDoc(docRef, { notes: notesList, updatedAt: new Date() });
          };

          // Add new note
          const addNote = async () => {
                    if (!noteText.trim()) return;

                    const newNote = {
                              id: Date.now(),
                              text: noteText.trim(),
                              category: noteCategory,
                              priority: notePriority,
                              createdAt: new Date().toISOString(),
                              lastEdited: new Date().toISOString(),
                              pinned: false,
                    };

                    const updated = [newNote, ...notes];
                    setNotes(updated);
                    await saveNotes(updated);
                    setNoteText('');
                    setNoteCategory('personal');
                    setNotePriority('medium');
                    setShowAdd(false);
          };

          // Delete note
          const deleteNote = async (id: number) => {
                    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                                  const updated = notes.filter((n) => n.id !== id);
                                                  setNotes(updated);
                                                  await saveNotes(updated);
                                        },
                              },
                    ]);
          };

          // Pin/unpin note
          const togglePin = async (id: number) => {
                    const updated = notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n));
                    setNotes(updated);
                    await saveNotes(updated);
          };

          // Filter and sort notes
          const filteredNotes = notes
                    .filter((note) => {
                              if (filter === 'all') return true;
                              if (filter === 'pinned') return note.pinned;
                              return note.category === filter;
                    })
                    .filter((note) => note.text.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => {
                              if (a.pinned && !b.pinned) return -1;
                              if (!a.pinned && b.pinned) return 1;
                              if (a.priority === 'high' && b.priority !== 'high') return -1;
                              if (a.priority !== 'high' && b.priority === 'high') return 1;
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });

          // Format date
          const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

                    if (diffInHours < 24) {
                              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else if (diffInHours < 48) {
                              return 'Yesterday';
                    } else {
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
          };

          // Stats
          const totalNotes = notes.length;
          const pinnedCount = notes.filter((n) => n.pinned).length;
          const importantCount = notes.filter((n) => n.category === 'important').length;

          const getCategoryColor = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.color || '#22c55e';
          const getCategoryIcon = (cat: string) => CATEGORIES.find((c) => c.id === cat)?.icon || '📝';
          const getPriorityColor = (pri: string) => PRIORITIES.find((p) => p.id === pri)?.color || '#f8961e';

          const styles = StyleSheet.create({
                    container: { flex: 1, backgroundColor: isDark ? '#0f0f17' : '#f8f9fa' },
                    header: { padding: 24, paddingTop: 16 },
                    title: { fontSize: 28, fontWeight: '700', color: isDark ? '#fff' : '#1e1e2d' },
                    subtitle: { fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 4 },
                    statsRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
                    statBox: {
                              backgroundColor: isDark ? '#1e1e2d' : '#fff',
                              borderRadius: 12,
                              padding: 14,
                              flex: 1,
                              alignItems: 'center',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    statNum: { fontSize: 22, fontWeight: '700', color: '#22c55e' },
                    statLabel: { fontSize: 11, color: isDark ? '#6b7280' : '#9ca3af', marginTop: 2 },
                    searchBox: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: isDark ? '#1e1e2d' : '#fff',
                              borderRadius: 12,
                              marginHorizontal: 20,
                              paddingHorizontal: 14,
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    searchInput: { flex: 1, paddingVertical: 12, color: isDark ? '#fff' : '#1e1e2d', fontSize: 14 },
                    filters: { paddingHorizontal: 20, marginBottom: 12 },
                    filterBtn: {
                              paddingVertical: 8,
                              paddingHorizontal: 14,
                              borderRadius: 20,
                              backgroundColor: isDark ? '#1e1e2d' : '#fff',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                              marginRight: 8,
                    },
                    filterActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
                    filterText: { fontSize: 12, fontWeight: '600', color: isDark ? '#9ca3af' : '#6b7280' },
                    filterTextActive: { color: '#fff' },
                    noteList: { paddingHorizontal: 20 },
                    noteCard: {
                              backgroundColor: isDark ? '#1e1e2d' : '#fff',
                              borderRadius: 14,
                              padding: 16,
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                              borderLeftWidth: 4,
                    },
                    noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
                    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
                    categoryText: { fontSize: 11, fontWeight: '600', color: '#fff' },
                    pinBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fef3c7', borderRadius: 8 },
                    noteText: { fontSize: 15, color: isDark ? '#fff' : '#1e1e2d', lineHeight: 22, marginBottom: 12 },
                    noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                    noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
                    noteDate: { fontSize: 12, color: isDark ? '#6b7280' : '#9ca3af' },
                    priorityDot: { width: 8, height: 8, borderRadius: 4 },
                    noteActions: { flexDirection: 'row', gap: 10 },
                    actionBtn: { padding: 6 },
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
                    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
                    modalContent: {
                              backgroundColor: isDark ? '#1e1e2d' : '#fff',
                              borderTopLeftRadius: 24,
                              borderTopRightRadius: 24,
                              padding: 24,
                              maxHeight: '85%',
                    },
                    modalTitle: { fontSize: 18, fontWeight: '700', color: isDark ? '#fff' : '#1e1e2d', marginBottom: 16 },
                    textArea: {
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 15,
                              color: isDark ? '#fff' : '#1e1e2d',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                              minHeight: 120,
                              textAlignVertical: 'top',
                              marginBottom: 16,
                    },
                    charCount: { fontSize: 12, color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'right', marginTop: -12, marginBottom: 12 },
                    sectionLabel: { fontSize: 13, fontWeight: '600', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 8 },
                    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
                    optionBtn: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 10,
                              backgroundColor: isDark ? '#0f0f17' : '#f8f9fa',
                              borderWidth: 1,
                              borderColor: isDark ? '#2d2d3d' : '#e5e7eb',
                    },
                    optionActive: { borderColor: '#22c55e', borderWidth: 2 },
                    optionText: { fontSize: 13, color: isDark ? '#fff' : '#1e1e2d' },
                    saveButton: { backgroundColor: '#22c55e', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
                    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
                    empty: { alignItems: 'center', paddingVertical: 60 },
                    emptyText: { color: isDark ? '#6b7280' : '#9ca3af', marginTop: 12, fontSize: 15 },
                    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
          });

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
                                        <Text style={styles.title}>📝 Professional Notes</Text>
                                        <Text style={styles.subtitle}>Organize your thoughts, ideas, and tasks</Text>

                                        {/* Stats */}
                                        <View style={styles.statsRow}>
                                                  <View style={styles.statBox}>
                                                            <Text style={styles.statNum}>{totalNotes}</Text>
                                                            <Text style={styles.statLabel}>Total</Text>
                                                  </View>
                                                  <View style={styles.statBox}>
                                                            <Text style={styles.statNum}>{pinnedCount}</Text>
                                                            <Text style={styles.statLabel}>Pinned</Text>
                                                  </View>
                                                  <View style={styles.statBox}>
                                                            <Text style={styles.statNum}>{importantCount}</Text>
                                                            <Text style={styles.statLabel}>Important</Text>
                                                  </View>
                                        </View>
                              </View>

                              {/* Search */}
                              <View style={styles.searchBox}>
                                        <Ionicons name="search" size={18} color={isDark ? '#6b7280' : '#9ca3af'} />
                                        <TextInput
                                                  style={styles.searchInput}
                                                  placeholder="Search notes..."
                                                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                                  value={search}
                                                  onChangeText={setSearch}
                                        />
                              </View>

                              {/* Filters */}
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                                        <View style={[styles.filters, { flexDirection: 'row' }]}>
                                                  <TouchableOpacity
                                                            style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
                                                            onPress={() => setFilter('all')}
                                                  >
                                                            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                                                  </TouchableOpacity>
                                                  <TouchableOpacity
                                                            style={[styles.filterBtn, filter === 'pinned' && styles.filterActive]}
                                                            onPress={() => setFilter('pinned')}
                                                  >
                                                            <Text style={[styles.filterText, filter === 'pinned' && styles.filterTextActive]}>📌 Pinned</Text>
                                                  </TouchableOpacity>
                                                  {CATEGORIES.map((cat) => (
                                                            <TouchableOpacity
                                                                      key={cat.id}
                                                                      style={[styles.filterBtn, filter === cat.id && styles.filterActive]}
                                                                      onPress={() => setFilter(cat.id)}
                                                            >
                                                                      <Text style={[styles.filterText, filter === cat.id && styles.filterTextActive]}>
                                                                                {cat.icon} {cat.label}
                                                                      </Text>
                                                            </TouchableOpacity>
                                                  ))}
                                        </View>
                              </ScrollView>

                              {/* Notes List */}
                              <ScrollView style={styles.noteList} showsVerticalScrollIndicator={false}>
                                        {filteredNotes.length === 0 ? (
                                                  <View style={styles.empty}>
                                                            <Ionicons name="document-text-outline" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
                                                            <Text style={styles.emptyText}>
                                                                      {search ? 'No notes match your search' : 'No notes yet. Add your first note!'}
                                                            </Text>
                                                  </View>
                                        ) : (
                                                  filteredNotes.map((note) => (
                                                            <View key={note.id} style={[styles.noteCard, { borderLeftColor: getCategoryColor(note.category) }]}>
                                                                      {/* Header */}
                                                                      <View style={styles.noteHeader}>
                                                                                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(note.category) }]}>
                                                                                          <Text>{getCategoryIcon(note.category)}</Text>
                                                                                          <Text style={styles.categoryText}>{note.category}</Text>
                                                                                </View>
                                                                                {note.pinned && (
                                                                                          <View style={styles.pinBadge}>
                                                                                                    <Text style={{ fontSize: 12 }}>📌</Text>
                                                                                          </View>
                                                                                )}
                                                                      </View>

                                                                      {/* Content */}
                                                                      <Text style={styles.noteText} numberOfLines={4}>
                                                                                {note.text}
                                                                      </Text>

                                                                      {/* Footer */}
                                                                      <View style={styles.noteFooter}>
                                                                                <View style={styles.noteMeta}>
                                                                                          <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                                                                                          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(note.priority) }]} />
                                                                                          <Text style={{ fontSize: 11, color: isDark ? '#6b7280' : '#9ca3af' }}>{note.priority}</Text>
                                                                                </View>
                                                                                <View style={styles.noteActions}>
                                                                                          <TouchableOpacity style={styles.actionBtn} onPress={() => togglePin(note.id)}>
                                                                                                    <Text style={{ fontSize: 16 }}>{note.pinned ? '📌' : '📍'}</Text>
                                                                                          </TouchableOpacity>
                                                                                          <TouchableOpacity style={styles.actionBtn} onPress={() => deleteNote(note.id)}>
                                                                                                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                                                                                          </TouchableOpacity>
                                                                                </View>
                                                                      </View>
                                                            </View>
                                                  ))
                                        )}
                                        <View style={{ height: 100 }} />
                              </ScrollView>

                              {/* FAB */}
                              <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
                                        <Ionicons name="add" size={28} color="#fff" />
                              </TouchableOpacity>

                              {/* Add Note Modal */}
                              <Modal visible={showAdd} transparent animationType="slide">
                                        <View style={styles.modalOverlay}>
                                                  <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAdd(false)} />
                                                  <View style={styles.modalContent}>
                                                            <Text style={styles.modalTitle}>✏️ Add New Note</Text>

                                                            <TextInput
                                                                      style={styles.textArea}
                                                                      placeholder="Write your note here..."
                                                                      placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                                                                      value={noteText}
                                                                      onChangeText={(t) => setNoteText(t.slice(0, 500))}
                                                                      multiline
                                                                      autoFocus
                                                            />
                                                            <Text style={styles.charCount}>{noteText.length}/500</Text>

                                                            {/* Category */}
                                                            <Text style={styles.sectionLabel}>Category</Text>
                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                                      <View style={styles.optionsRow}>
                                                                                {CATEGORIES.map((cat) => (
                                                                                          <TouchableOpacity
                                                                                                    key={cat.id}
                                                                                                    style={[styles.optionBtn, noteCategory === cat.id && styles.optionActive]}
                                                                                                    onPress={() => setNoteCategory(cat.id)}
                                                                                          >
                                                                                                    <Text>{cat.icon}</Text>
                                                                                                    <Text style={styles.optionText}>{cat.label}</Text>
                                                                                          </TouchableOpacity>
                                                                                ))}
                                                                      </View>
                                                            </ScrollView>

                                                            {/* Priority */}
                                                            <Text style={styles.sectionLabel}>Priority</Text>
                                                            <View style={styles.optionsRow}>
                                                                      {PRIORITIES.map((pri) => (
                                                                                <TouchableOpacity
                                                                                          key={pri.id}
                                                                                          style={[styles.optionBtn, notePriority === pri.id && { borderColor: pri.color, borderWidth: 2 }]}
                                                                                          onPress={() => setNotePriority(pri.id)}
                                                                                >
                                                                                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pri.color }} />
                                                                                          <Text style={styles.optionText}>{pri.label}</Text>
                                                                                </TouchableOpacity>
                                                                      ))}
                                                            </View>

                                                            <TouchableOpacity style={styles.saveButton} onPress={addNote}>
                                                                      <Text style={styles.saveButtonText}>💾 Save Note</Text>
                                                            </TouchableOpacity>
                                                  </View>
                                        </View>
                              </Modal>
                    </SafeAreaView>
          );
}
