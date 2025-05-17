import React from 'react';
import ReactDOM from 'react-dom/client';  // For React 18 and above
import App from './App';  // Make sure to import App.js
import './index.css';  // Optional: your custom CSS styles

// Rendering the React app to the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
