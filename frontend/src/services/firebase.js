// Importar módulos de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración del proyecto (copiada de Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBGgY9oUeOVJL54YzFA10WnaaEucwK6RxQ",
  authDomain: "proyecto-poli-temu.firebaseapp.com",
  projectId: "proyecto-poli-temu",
  storageBucket: "proyecto-poli-temu.appspot.com", 
  messagingSenderId: "600404367775",
  appId: "1:600404367775:web:ae3dea6ed94cc1787f45aa",
  measurementId: "G-V7E0SS1J6P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);      // Para login/registro
export const db = getFirestore(app);   // Para base de datos
