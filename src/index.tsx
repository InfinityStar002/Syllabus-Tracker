import React from 'react';
import ReactDOM from 'react-dom/client';
import SyllabusTracker from './App';
import './styles.css';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SyllabusTracker />
  </React.StrictMode>
);
