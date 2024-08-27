// src/components/Register/Header.js
import React from 'react';
import styles from '../../css/Register/RegisterHeader.module.css';

const Header = () => (
  <header className={styles.register_header}>
    <div className={styles.logo}>Budget Manager</div>
    <a href="/login" className={styles.login_link}>Login</a>
  </header>
);

export default Header;
