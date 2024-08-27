import React from 'react';
import styles from '../../css/Login/loginHeader.module.css'; // Import the CSS module

const socialLogin = () => {
  return (
    <header className={styles.header}>
        <div className={styles.logo}>Budget Manager</div>
        <a href="register" className={styles.register_link}>Register</a>
    </header>
  );
};

export default socialLogin;
