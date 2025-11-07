import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBnGVkCZr7nIg7cJ0Rgqzv0oQMbpF2lF3c",
  authDomain: "ibtakar.firebaseapp.com",
  databaseURL: "https://ibtakar-default-rtdb.firebaseio.com",
  projectId: "ibtakar",
  storageBucket: "ibtakar.firebasestorage.app",
  messagingSenderId: "59240945977",
  appId: "1:59240945977:web:bcbd08c595ffb7668930e8",
  measurementId: "G-C6G4RLK8Q9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export default app;
