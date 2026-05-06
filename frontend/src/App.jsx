import { useState } from 'react'
import './App.css'
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <main>
      <h1>PoliTemu</h1>
      <h2>PRUEBA PARA FIREBASE</h2>
      <p>Login</p>
      <Login />
      <Register />
    </main>
  );
}

export default App;


