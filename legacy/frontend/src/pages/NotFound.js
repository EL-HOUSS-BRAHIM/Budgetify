import React from 'react';
import { Link } from 'react-router-dom';
import '../css/NotFound.module.css'; // Create a corresponding CSS file

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
};

export default NotFound;
