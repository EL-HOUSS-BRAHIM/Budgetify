// src/components/Register/SocialRegister.js
import React from 'react';
import styles from '../../css/Register/SocialRegister.module.css';

const SocialRegister = () => (
  <div className={styles.social_register}>
    <p>Or register with:</p>
    <button className={styles.google_btn}>
      <i className="fab fa-google"></i> Google
    </button>
    <button className={styles.facebook_btn}>
      <i className="fab fa-facebook-f"></i> Facebook
    </button>
  </div>
);

export default SocialRegister;
