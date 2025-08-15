import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add Roboto/Inter font from Google Fonts
const linkEl = document.createElement('link');
linkEl.setAttribute('rel', 'stylesheet');
linkEl.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
document.head.appendChild(linkEl);

// Set page title
document.title = 'Tribes | Web3 Community Platform';

// Add meta theme color
const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#000000'; // Default dark theme color
document.head.appendChild(metaThemeColor);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);