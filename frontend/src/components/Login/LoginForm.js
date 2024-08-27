import React, { useState, useRef } from 'react';
import styles from '../../css/Login/LoginForm.module.css';

function LoginForm({ onSubmit, credentials, handleChange }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordInputRef = useRef(null);

  const handlePasswordToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <form className={styles.login_form} id="loginForm" onSubmit={onSubmit}>
      <h1>Login</h1>
      <div className={styles.form_group}>
        <label htmlFor="email">Email</label>
        <input
          value={credentials.email}
          onChange={handleChange}
          type="email"
          id="email"
          name="email"
          required
        />
      </div>
      <div className={styles.form_group}>
        <label htmlFor="password">Password</label>
        <div className={styles.login_div_position}>
          <input
            value={credentials.password}
            onChange={handleChange}
            type={passwordVisible ? 'text' : 'password'}
            id="password"
            name="password"
            ref={passwordInputRef}
            required
          />
          <i
            className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'} ${styles.password_toggle}`}
            onClick={handlePasswordToggle}
          ></i>
        </div>
      </div>
      <div className={styles.form_group}>
        <input type="checkbox" id="remember" name="remember" />
        <label htmlFor="remember">Remember me</label>
      </div>
      <button type="submit" className={styles.login_btn}>Login</button>
      <a href="/pass_reset" className={styles.forgot_password}>Forgot password?</a>
      <div id="errorMessage" className={styles.error_message}></div>
      <div id="successMessage" className={styles.success_message}></div>
    </form>
  );
}

export default LoginForm;
