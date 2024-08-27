import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/Home/HomeHeader.module.css';

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Budget Manager</div>
      <nav className={styles.navbar}>
        <div className={styles.hamburger} onClick={toggleMenu}>
          {/* Change icon based on menu visibility */}
          {menuVisible ? (
            <div className={styles.close_icon}>
              <div className={styles.close_line}></div>
              <div className={styles.close_line}></div>
            </div>
          ) : (
            <>
              <div className={styles.hamburger_line}></div>
              <div className={styles.hamburger_line}></div>
              <div className={styles.hamburger_line}></div>
            </>
          )}
        </div>
        <ul className={`${styles.nav_list} ${menuVisible ? styles.show : ''}`}>
          <li><Link to="#home">Home</Link></li>
          <li><Link to="#features">Features</Link></li>
          <li><Link to="#about">About</Link></li>
          <li><Link to="#contact">Contact</Link></li>
        </ul>
      </nav>
      <div className={styles.auth_buttons}>
        <Link to="/login">
          <button className={styles.login_btn}>Login</button>
        </Link>
        <Link to="/register">
          <button className={styles.register_btn}>Register</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;