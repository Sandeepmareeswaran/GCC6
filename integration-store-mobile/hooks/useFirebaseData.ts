// Hook to get user data from Clerk and map to Firebase
import { useUser } from '@clerk/clerk-expo';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';

export interface UserData {
          email: string;
          isLoaded: boolean;
}

export function useFirebaseUser() {
          const { user, isLoaded } = useUser();

          const getUserEmail = (): string => {
                    if (!user) return 'guest';
                    return user.primaryEmailAddress?.emailAddress || 'guest';
          };

          return {
                    email: getUserEmail(),
                    isLoaded,
                    isSignedIn: !!user,
                    user,
          };
}

// Hook to get ToDo data
export function useTodos() {
          const { email, isLoaded } = useFirebaseUser();
          const [todos, setTodos] = useState<any[]>([]);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
                    if (!isLoaded || email === 'guest') {
                              setLoading(false);
                              return;
                    }

                    const docRef = doc(db, 'GCCToDo', email);
                    const unsubscribe = onSnapshot(docRef, (snapshot) => {
                              if (snapshot.exists()) {
                                        const data = snapshot.data();
                                        setTodos(data.cols || []);
                              } else {
                                        setTodos([]);
                              }
                              setLoading(false);
                    });

                    return () => unsubscribe();
          }, [email, isLoaded]);

          const saveTodos = async (cols: any[]) => {
                    if (email === 'guest') return;
                    const docRef = doc(db, 'GCCToDo', email);
                    await setDoc(docRef, { cols, meta: { user: email, updatedAt: new Date() } });
          };

          return { todos, loading, saveTodos };
}

// Hook to get Notes data
export function useNotes() {
          const { email, isLoaded } = useFirebaseUser();
          const [notes, setNotes] = useState<any[]>([]);
          const [loading, setLoading] = useState(true);

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

          const saveNotes = async (notesList: any[]) => {
                    if (email === 'guest') return;
                    const docRef = doc(db, 'Gccusernotes', email);
                    await setDoc(docRef, { notes: notesList, user: email, updatedAt: new Date() });
          };

          return { notes, loading, saveNotes };
}

// Hook to get Calendar events
export function useCalendarEvents() {
          const { email, isLoaded } = useFirebaseUser();
          const [events, setEvents] = useState<any[]>([]);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
                    if (!isLoaded || email === 'guest') {
                              setLoading(false);
                              return;
                    }

                    const docRef = doc(db, 'GCCCalander', email);
                    const unsubscribe = onSnapshot(docRef, (snapshot) => {
                              if (snapshot.exists()) {
                                        const data = snapshot.data();
                                        setEvents(data.events || []);
                              } else {
                                        setEvents([]);
                              }
                              setLoading(false);
                    });

                    return () => unsubscribe();
          }, [email, isLoaded]);

          const saveEvents = async (eventsList: any[]) => {
                    if (email === 'guest') return;
                    const docRef = doc(db, 'GCCCalander', email);
                    await setDoc(docRef, { events: eventsList, user: email, updatedAt: new Date().toISOString() });
          };

          return { events, loading, saveEvents };
}
