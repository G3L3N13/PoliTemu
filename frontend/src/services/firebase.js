// frontend/src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGgY9oUeOVJL54YzFA10WnaaEucwK6RxQ",
  authDomain: "proyecto-poli-temu.firebaseapp.com",
  projectId: "proyecto-poli-temu",
  storageBucket: "proyecto-poli-temu.appspot.com",
  messagingSenderId: "600404367775",
  appId: "1:600404367775:web:ae3dea6ed94cc1787f45aa",
  measurementId: "G-V7E0SS1J6P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;