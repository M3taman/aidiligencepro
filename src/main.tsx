import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './index.css'; // Or your global styles

// Initialize Sentry only if DSN is available
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN && SENTRY_DSN !== 'your-sentry-dsn') {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Basic configuration without problematic integrations
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.5,
    debug: import.meta.env.DEV,
  });
}

// Request notification permission if needed
if ('Notification' in window) {
  window.addEventListener('load', () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
