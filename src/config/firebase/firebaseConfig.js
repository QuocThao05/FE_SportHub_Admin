import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGyiX9sLAEo2inz3m6ovkF43Zn4PYvPts",
  authDomain: "train-up-b41f4.firebaseapp.com",
  projectId: "train-up-b41f4",
  storageBucket: "train-up-b41f4.firebasestorage.app",
  messagingSenderId: "331987609179",
  appId: "1:331987609179:web:39b4935682d1560cb5017e",
  measurementId: "G-KXQ6CM1CBY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
