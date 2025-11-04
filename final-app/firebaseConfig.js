import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCeH1eUvP6_5DlCuGo2r41koiy9wCsvH0s",
  authDomain: "book-app-19cb8.firebaseapp.com",
  projectId: "book-app-19cb8",
  storageBucket: "book-app-19cb8.firebasestorage.app",
  messagingSenderId: "994019588599",
  appId: "1:994019588599:web:af2c954115a4b4373296f2",
  measurementId: "G-DS4HVB85RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
