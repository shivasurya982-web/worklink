import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PWAProvider } from './context/PWAContext';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Worklyn PWA Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('Worklyn PWA Service Worker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PWAProvider>
      <App />
    </PWAProvider>
  </React.StrictMode>
);
