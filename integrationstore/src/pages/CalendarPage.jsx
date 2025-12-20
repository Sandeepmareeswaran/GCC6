import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const COLLECTION = 'GCCCalander';

// Days of week
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];

// Event colors
const EVENT_COLORS = [
          { name: 'Blue', value: '#3b82f6' },
          { name: 'Green', value: '#22c55e' },
          { name: 'Orange', value: '#f97316' },
          { name: 'Purple', value: '#8b5cf6' },
          { name: 'Pink', value: '#ec4899' },
          { name: 'Red', value: '#ef4444' },
];

// Styles
const styles = {
          container: {
                    padding: '32px 40px',
                    minHeight: '100vh',
                    fontFamily: "'Inter', sans-serif",
          },
          header: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '28px',
          },
          title: {
                    fontSize: '28px',
                    fontWeight: '700',
                    letterSpacing: '-0.5px',
          },
          nav: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
          },
          navBtn: {
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    background: 'var(--content-card, #fff)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    transition: 'all 0.15s',
          },
          monthYear: {
                    fontSize: '18px',
                    fontWeight: '600',
                    minWidth: '180px',
                    textAlign: 'center',
          },
          todayBtn: {
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--sidebar-bg, #1e1e2d)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginLeft: '12px',
          },
          calendarGrid: {
                    background: 'var(--content-card, #fff)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    overflow: 'hidden',
          },
          daysHeader: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    background: 'var(--bg-primary, #f5f5f5)',
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
          },
          dayHeader: {
                    padding: '14px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--content-text-muted, #6b7280)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
          },
          daysGrid: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
          },
          dayCell: {
                    minHeight: '110px',
                    padding: '8px',
                    borderRight: '1px solid var(--border-color, #e5e7eb)',
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    position: 'relative',
          },
          dayCellHover: {
                    background: 'var(--bg-primary, #f8f9fa)',
          },
          dayNumber: {
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px',
          },
          otherMonth: {
                    color: 'var(--content-text-muted, #9ca3af)',
          },
          today: {
                    width: '28px',
                    height: '28px',
                    background: 'var(--sidebar-bg, #1e1e2d)',
                    color: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
          },
          eventPill: {
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#fff',
                    marginBottom: '3px',
                    cursor: 'grab',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
          },
          moreEvents: {
                    fontSize: '11px',
                    color: 'var(--content-text-muted, #6b7280)',
                    fontWeight: '500',
                    marginTop: '2px',
          },
          // Modal
          modalOverlay: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
          },
          modal: {
                    background: 'var(--content-card, #fff)',
                    borderRadius: '16px',
                    width: '400px',
                    maxWidth: '90vw',
                    padding: '24px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          },
          modalTitle: {
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '20px',
          },
          formGroup: {
                    marginBottom: '16px',
          },
          label: {
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '6px',
                    color: 'var(--content-text, #1e1e2d)',
          },
          input: {
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
          },
          colorPicker: {
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
          },
          colorOption: {
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '3px solid transparent',
                    transition: 'all 0.15s',
          },
          colorSelected: {
                    border: '3px solid var(--sidebar-bg, #1e1e2d)',
                    transform: 'scale(1.1)',
          },
          modalActions: {
                    display: 'flex',
                    gap: '10px',
                    marginTop: '24px',
          },
          btnPrimary: {
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--sidebar-bg, #1e1e2d)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
          },
          btnSecondary: {
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    background: 'transparent',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
          },
          btnDelete: {
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
          },
};

export default function CalendarPage() {
          const [currentDate, setCurrentDate] = useState(new Date());
          const [events, setEvents] = useState([]);
          const [showModal, setShowModal] = useState(false);
          const [selectedDate, setSelectedDate] = useState(null);
          const [editingEvent, setEditingEvent] = useState(null);
          const [eventTitle, setEventTitle] = useState('');
          const [eventColor, setEventColor] = useState(EVENT_COLORS[0].value);
          const [draggedEvent, setDraggedEvent] = useState(null);
          const [hoveredCell, setHoveredCell] = useState(null);
          const { currentTheme } = useTheme();
          const { t } = useLanguage();

          const getUserEmail = () => localStorage.getItem('userEmail') || 'guest';

          // Load events from Firebase
          useEffect(() => {
                    const email = getUserEmail();
                    const docRef = doc(db, COLLECTION, email);

                    const unsubscribe = onSnapshot(docRef, (snapshot) => {
                              if (snapshot.exists()) {
                                        const data = snapshot.data();
                                        setEvents(data.events || []);
                              } else {
                                        setEvents([]);
                              }
                    });

                    return () => unsubscribe();
          }, []);

          // Save events to Firebase
          const saveEvents = async (newEvents) => {
                    const email = getUserEmail();
                    const docRef = doc(db, COLLECTION, email);
                    await setDoc(docRef, {
                              events: newEvents,
                              updatedAt: new Date().toISOString(),
                              user: email
                    });
          };

          // Get days for current month view
          const getDaysInMonth = () => {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();

                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);

                    const days = [];

                    // Add days from previous month
                    const startDay = firstDay.getDay();
                    const prevMonthDays = new Date(year, month, 0).getDate();
                    for (let i = startDay - 1; i >= 0; i--) {
                              days.push({
                                        date: new Date(year, month - 1, prevMonthDays - i),
                                        isCurrentMonth: false,
                              });
                    }

                    // Add days of current month
                    for (let i = 1; i <= lastDay.getDate(); i++) {
                              days.push({
                                        date: new Date(year, month, i),
                                        isCurrentMonth: true,
                              });
                    }

                    // Add days from next month
                    const remaining = 42 - days.length;
                    for (let i = 1; i <= remaining; i++) {
                              days.push({
                                        date: new Date(year, month + 1, i),
                                        isCurrentMonth: false,
                              });
                    }

                    return days;
          };

          const formatDateKey = (date) => {
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          };

          const getEventsForDate = (date) => {
                    const dateKey = formatDateKey(date);
                    return events.filter(e => e.date === dateKey);
          };

          const isToday = (date) => {
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
          };

          // Navigation
          const goToPrevMonth = () => {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
          };

          const goToNextMonth = () => {
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
          };

          const goToToday = () => {
                    setCurrentDate(new Date());
          };

          // Event management
          const openCreateModal = (date) => {
                    setSelectedDate(date);
                    setEditingEvent(null);
                    setEventTitle('');
                    setEventColor(EVENT_COLORS[0].value);
                    setShowModal(true);
          };

          const openEditModal = (event, e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                    setEventTitle(event.title);
                    setEventColor(event.color);
                    setSelectedDate(null);
                    setShowModal(true);
          };

          const saveEvent = async () => {
                    if (!eventTitle.trim()) return;

                    let newEvents;
                    if (editingEvent) {
                              // Update existing event
                              newEvents = events.map(e =>
                                        e.id === editingEvent.id
                                                  ? { ...e, title: eventTitle, color: eventColor }
                                                  : e
                              );
                    } else {
                              // Create new event
                              const newEvent = {
                                        id: `evt-${Date.now()}`,
                                        title: eventTitle,
                                        date: formatDateKey(selectedDate),
                                        color: eventColor,
                              };
                              newEvents = [...events, newEvent];
                    }

                    setEvents(newEvents);
                    await saveEvents(newEvents);
                    setShowModal(false);
          };

          const deleteEvent = async () => {
                    if (!editingEvent) return;
                    const newEvents = events.filter(e => e.id !== editingEvent.id);
                    setEvents(newEvents);
                    await saveEvents(newEvents);
                    setShowModal(false);
          };

          // Drag and Drop
          const handleDragStart = (event, e) => {
                    e.stopPropagation();
                    setDraggedEvent(event);
                    e.dataTransfer.effectAllowed = 'move';
          };

          const handleDragOver = (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
          };

          const handleDrop = async (targetDate, e) => {
                    e.preventDefault();
                    if (!draggedEvent) return;

                    const newDateKey = formatDateKey(targetDate);
                    if (draggedEvent.date === newDateKey) {
                              setDraggedEvent(null);
                              return;
                    }

                    const newEvents = events.map(evt =>
                              evt.id === draggedEvent.id
                                        ? { ...evt, date: newDateKey }
                                        : evt
                    );

                    setEvents(newEvents);
                    await saveEvents(newEvents);
                    setDraggedEvent(null);
                    setHoveredCell(null);
          };

          const days = getDaysInMonth();

          return (
                    <div style={{ ...styles.container, background: currentTheme.bgPrimary, color: currentTheme.textPrimary }}>
                              {/* Header */}
                              <div style={styles.header}>
                                        <h1 style={styles.title}>{t('Calendar')}</h1>
                                        <div style={styles.nav}>
                                                  <button style={styles.navBtn} onClick={goToPrevMonth}>←</button>
                                                  <span style={styles.monthYear}>
                                                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                                                  </span>
                                                  <button style={styles.navBtn} onClick={goToNextMonth}>→</button>
                                                  <button style={styles.todayBtn} onClick={goToToday}>{t('Today')}</button>
                                        </div>
                              </div>

                              {/* Calendar Grid */}
                              <div style={styles.calendarGrid}>
                                        {/* Days Header */}
                                        <div style={styles.daysHeader}>
                                                  {DAYS.map(day => (
                                                            <div key={day} style={styles.dayHeader}>{t(day)}</div>
                                                  ))}
                                        </div>

                                        {/* Days Grid */}
                                        <div style={styles.daysGrid}>
                                                  {days.map((day, idx) => {
                                                            const dateKey = formatDateKey(day.date);
                                                            const dayEvents = getEventsForDate(day.date);
                                                            const isHovered = hoveredCell === dateKey;

                                                            return (
                                                                      <div
                                                                                key={idx}
                                                                                style={{
                                                                                          ...styles.dayCell,
                                                                                          ...(isHovered ? styles.dayCellHover : {}),
                                                                                          ...(idx % 7 === 6 ? { borderRight: 'none' } : {}),
                                                                                          background: draggedEvent && isHovered ? 'var(--accent-light, #dcfce7)' : undefined,
                                                                                }}
                                                                                onClick={() => openCreateModal(day.date)}
                                                                                onDragOver={handleDragOver}
                                                                                onDragEnter={() => setHoveredCell(dateKey)}
                                                                                onDragLeave={() => setHoveredCell(null)}
                                                                                onDrop={(e) => handleDrop(day.date, e)}
                                                                                onMouseEnter={() => !draggedEvent && setHoveredCell(dateKey)}
                                                                                onMouseLeave={() => !draggedEvent && setHoveredCell(null)}
                                                                      >
                                                                                <div
                                                                                          style={{
                                                                                                    ...styles.dayNumber,
                                                                                                    ...(!day.isCurrentMonth ? styles.otherMonth : {}),
                                                                                          }}
                                                                                >
                                                                                          {isToday(day.date) ? (
                                                                                                    <div style={styles.today}>{day.date.getDate()}</div>
                                                                                          ) : (
                                                                                                    day.date.getDate()
                                                                                          )}
                                                                                </div>

                                                                                {dayEvents.slice(0, 3).map(evt => (
                                                                                          <div
                                                                                                    key={evt.id}
                                                                                                    style={{ ...styles.eventPill, background: evt.color }}
                                                                                                    draggable
                                                                                                    onDragStart={(e) => handleDragStart(evt, e)}
                                                                                                    onClick={(e) => openEditModal(evt, e)}
                                                                                          >
                                                                                                    {evt.title}
                                                                                          </div>
                                                                                ))}
                                                                                {dayEvents.length > 3 && (
                                                                                          <div style={styles.moreEvents}>+{dayEvents.length - 3} more</div>
                                                                                )}
                                                                      </div>
                                                            );
                                                  })}
                                        </div>
                              </div>

                              {/* Modal */}
                              {showModal && (
                                        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                                                  <div style={{ ...styles.modal, background: currentTheme.bgCard }} onClick={e => e.stopPropagation()}>
                                                            <h3 style={styles.modalTitle}>
                                                                      {editingEvent ? t('Edit Event') : t('New Event')}
                                                            </h3>

                                                            <div style={styles.formGroup}>
                                                                      <label style={styles.label}>{t('Event Title')}</label>
                                                                      <input
                                                                                type="text"
                                                                                style={styles.input}
                                                                                value={eventTitle}
                                                                                onChange={(e) => setEventTitle(e.target.value)}
                                                                                placeholder={t('Enter event title...')}
                                                                                autoFocus
                                                                      />
                                                            </div>

                                                            {!editingEvent && selectedDate && (
                                                                      <div style={styles.formGroup}>
                                                                                <label style={styles.label}>{t('Date')}</label>
                                                                                <input
                                                                                          type="text"
                                                                                          style={{ ...styles.input, background: 'var(--bg-primary, #f5f5f5)' }}
                                                                                          value={selectedDate.toLocaleDateString()}
                                                                                          readOnly
                                                                                />
                                                                      </div>
                                                            )}

                                                            <div style={styles.formGroup}>
                                                                      <label style={styles.label}>{t('Color')}</label>
                                                                      <div style={styles.colorPicker}>
                                                                                {EVENT_COLORS.map(color => (
                                                                                          <div
                                                                                                    key={color.value}
                                                                                                    style={{
                                                                                                              ...styles.colorOption,
                                                                                                              background: color.value,
                                                                                                              ...(eventColor === color.value ? styles.colorSelected : {}),
                                                                                                    }}
                                                                                                    onClick={() => setEventColor(color.value)}
                                                                                          />
                                                                                ))}
                                                                      </div>
                                                            </div>

                                                            <div style={styles.modalActions}>
                                                                      {editingEvent && (
                                                                                <button style={styles.btnDelete} onClick={deleteEvent}>
                                                                                          {t('Delete')}
                                                                                </button>
                                                                      )}
                                                                      <button style={styles.btnSecondary} onClick={() => setShowModal(false)}>
                                                                                {t('Cancel')}
                                                                      </button>
                                                                      <button style={styles.btnPrimary} onClick={saveEvent}>
                                                                                {editingEvent ? t('Update') : t('Create')}
                                                                      </button>
                                                            </div>
                                                  </div>
                                        </div>
                              )}
                    </div>
          );
}
