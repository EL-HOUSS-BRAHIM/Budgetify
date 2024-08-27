import React from 'react';
import ReactDOM from 'react-dom/client'; // Update import to 'react-dom/client'
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import './css/DMT/DMT.module.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create root element
root.render(
  <Router>
    <App />
  </Router>
);
