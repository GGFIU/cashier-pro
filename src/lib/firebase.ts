
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, indexedDBLocalPersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA3yjw8OHhnaEvtPTQziHb4qvaT3JGLTE",
  authDomain: "cashierpro-6431f.firebaseapp.com",
  projectId: "cashierpro-6431f",
  storageBucket: "cashierpro-6431f.firebasestorage.app",
  messagingSenderId: "331307469609",
  appId: "1:331307469609:web:b02d3d2b026c55706e8538"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});
