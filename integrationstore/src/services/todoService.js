// Service for storing todos in Firestore under collection 'GCCToDo'
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

const COLLECTION = "GCCToDo";

export async function getTodos(userEmail) {
  if (!userEmail) return null;
  const ref = doc(db, COLLECTION, userEmail);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.cols ?? null;
}

export async function saveTodos(userEmail, cols) {
  if (!userEmail) return;
  const ref = doc(db, COLLECTION, userEmail);
  // store cols plus document-level metadata for easier querying/inspection
  const meta = { user: userEmail, updatedAt: Timestamp.now() };
  await setDoc(ref, { cols, meta });
}

// Subscribe to realtime updates; callback receives `cols` or null
export function subscribeTodos(userEmail, callback) {
  if (!userEmail) return () => {};
  const ref = doc(db, COLLECTION, userEmail);
  const unsub = onSnapshot(ref, snap => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback(data.cols ?? null);
  });
  return unsub;
}

export default { getTodos, saveTodos, subscribeTodos };
