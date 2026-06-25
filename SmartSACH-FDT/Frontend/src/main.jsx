import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Si tienes estilos CSS globales o personalizados de tu rama, los importas aquí:
import './assets/css/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);