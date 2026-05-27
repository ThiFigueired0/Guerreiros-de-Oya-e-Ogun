import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext';

// Suppress Supabase Refresh Token Not Found errors
const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('Refresh Token Not Found')) {
    return;
  }
  if (args.length > 0 && args[0]?.message?.includes('Refresh Token')) {
    return;
  }
  originalError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Refresh Token Not Found')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
