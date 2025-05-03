import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client' for React 18 and above
import BarcodeScanner from './Predict';  // Import BarcodeScanner
import './index.css'; // Assuming you have an index.css file for global styles

const root = ReactDOM.createRoot(document.getElementById('root')); // Create the root using createRoot
root.render(
  <React.StrictMode>
    <BarcodeScanner />  {/* Rendering BarcodeScanner Component */}
  </React.StrictMode>
);
