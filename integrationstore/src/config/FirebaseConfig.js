// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
          apiKey: "AIzaSyAS7rhh4gFFbdJ7ueJq_bmors4Yhyq5COY",
          authDomain: "aram-eyecare.firebaseapp.com",
          projectId: "aram-eyecare",
          storageBucket: "gs://aram-eyecare.firebasestorage.app", // Fixed storageBucket URL
          messagingSenderId: "1062575352894",
          appId: "1:1062575352894:web:53f81c822ddd30da4b756f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore instance and the Firebase app
export { db };
export default app;