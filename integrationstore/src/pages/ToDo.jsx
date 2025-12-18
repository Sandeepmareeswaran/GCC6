import React, { useState } from 'react';

function ToDo() {
          const [tasks, setTasks] = useState([
                    { id: 1, text: 'Complete Jira integration', completed: true, priority: 'high' },
                    { id: 2, text: 'Design dashboard components', completed: true, priority: 'medium' },
                    { id: 3, text: 'Implement Firebase storage', completed: false, priority: 'high' },
                    { id: 4, text: 'Write API documentation', completed: false, priority: 'low' },
                    { id: 5, text: 'Test user authentication flow', completed: false, priority: 'medium' },
          ]);
          const [newTask, setNewTask] = useState('');

          const styles = {
                    container: {
                              padding: '10px',
                    },
                    header: {
                              marginBottom: '30px',
                    },
                    title: {
                              fontSize: '28px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '5px',
                    },
                    subtitle: {
                              fontSize: '14px',
                              color: '#6b7280',
                    },
                    statsRow: {
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '20px',
                              marginBottom: '30px',
                    },
                    statCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '24px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                              textAlign: 'center',
                    },
                    statValue: {
                              fontSize: '32px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '4px',
                    },
                    statLabel: {
                              fontSize: '13px',
                              color: '#6b7280',
                    },
                    addTaskCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '20px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                              marginBottom: '20px',
                              display: 'flex',
                              gap: '12px',
                    },
                    input: {
                              flex: 1,
                              padding: '14px 16px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '10px',
                              fontSize: '14px',
                              color: '#1e1e2d',
                              outline: 'none',
                    },
                    addBtn: {
                              padding: '14px 28px',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                    },
                    taskList: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                              overflow: 'hidden',
                    },
                    taskItem: {
                              padding: '18px 24px',
                              borderBottom: '1px solid #f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              transition: 'background 0.2s',
                    },
                    checkbox: {
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              border: '2px solid #d1d5db',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.2s',
                    },
                    checkboxChecked: {
                              background: '#22c55e',
                              borderColor: '#22c55e',
                    },
                    taskText: {
                              flex: 1,
                              fontSize: '15px',
                              color: '#1e1e2d',
                    },
                    taskTextCompleted: {
                              textDecoration: 'line-through',
                              color: '#9ca3af',
                    },
                    priority: {
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                    },
                    deleteBtn: {
                              background: 'none',
                              border: 'none',
                              color: '#9ca3af',
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '4px',
                    },
          };

          const priorityColors = {
                    high: { bg: '#fef2f2', color: '#dc2626' },
                    medium: { bg: '#fef3c7', color: '#d97706' },
                    low: { bg: '#f0fdf4', color: '#16a34a' },
          };

          const handleAddTask = () => {
                    if (newTask.trim()) {
                              setTasks([...tasks, { id: Date.now(), text: newTask, completed: false, priority: 'medium' }]);
                              setNewTask('');
                    }
          };

          const toggleTask = (id) => {
                    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
          };

          const deleteTask = (id) => {
                    setTasks(tasks.filter(t => t.id !== id));
          };

          const completedCount = tasks.filter(t => t.completed).length;
          const pendingCount = tasks.filter(t => !t.completed).length;

          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.title}>To-Do List</h1>
                                        <p style={styles.subtitle}>Manage your tasks and stay productive</p>
                              </div>

                              <div style={styles.statsRow}>
                                        <div style={styles.statCard}>
                                                  <div style={{ ...styles.statValue, color: '#22c55e' }}>{completedCount}</div>
                                                  <div style={styles.statLabel}>Completed</div>
                                        </div>
                                        <div style={styles.statCard}>
                                                  <div style={{ ...styles.statValue, color: '#f97316' }}>{pendingCount}</div>
                                                  <div style={styles.statLabel}>Pending</div>
                                        </div>
                                        <div style={styles.statCard}>
                                                  <div style={styles.statValue}>{tasks.length}</div>
                                                  <div style={styles.statLabel}>Total Tasks</div>
                                        </div>
                              </div>

                              <div style={styles.addTaskCard}>
                                        <input
                                                  type="text"
                                                  style={styles.input}
                                                  placeholder="Add a new task..."
                                                  value={newTask}
                                                  onChange={(e) => setNewTask(e.target.value)}
                                                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                        />
                                        <button style={styles.addBtn} onClick={handleAddTask}>Add Task</button>
                              </div>

                              <div style={styles.taskList}>
                                        {tasks.map(task => (
                                                  <div key={task.id} style={{ ...styles.taskItem, background: task.completed ? '#fafafa' : '#fff' }}>
                                                            <div
                                                                      style={{ ...styles.checkbox, ...(task.completed ? styles.checkboxChecked : {}) }}
                                                                      onClick={() => toggleTask(task.id)}
                                                            >
                                                                      {task.completed && <span style={{ color: '#fff', fontSize: '14px' }}>✓</span>}
                                                            </div>
                                                            <span style={{ ...styles.taskText, ...(task.completed ? styles.taskTextCompleted : {}) }}>
                                                                      {task.text}
                                                            </span>
                                                            <span style={{ ...styles.priority, background: priorityColors[task.priority].bg, color: priorityColors[task.priority].color }}>
                                                                      {task.priority}
                                                            </span>
                                                            <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>🗑️</button>
                                                  </div>
                                        ))}
                              </div>
                    </div>
          );
}

export default ToDo;