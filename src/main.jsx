import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initAnalytics } from './analytics.js';
import '@fontsource-variable/archivo/wdth.css';
import './lightbox.css';
import './styles.css';

initAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
