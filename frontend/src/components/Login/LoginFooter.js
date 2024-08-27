
import React from 'react';
import styles from '../../css/Login/loginFooter.module.css'; // Import the CSS module

const socialLogin = () => {
  return (
    <footer className={styles.footer}>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
    </footer>
  );
};

export default socialLogin;
