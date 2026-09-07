import React from 'react';
import styles from '../../css/Home/HomeFooter.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_links}>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
      </div>
      <div className={styles.social_icons}>
        <a href="fase" className={styles.social_icon} title="Facebook"><i className="fab fa-facebook"></i></a>
        <a href="test" className={styles.social_icon} title="Twitter"><i className="fab fa-twitter"></i></a>
        <a href="test" className={styles.social_icon} title="Instagram"><i className="fab fa-instagram"></i></a>
      </div>
      <div className={styles.contact_info}>
        <p>Contact: info@budgetmanager.com</p>
      </div>
      <p>&copy; 2024 Automatic Budget Manager. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
