// src/components/Register/Form.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../utils/auth';
import styles from '../../css/Register/RegisterForm.module.css';

const Form = ({ setErrorMessage, setSuccessMessage }) => {
  const [user, setUser] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = user;

    if (name.length < 4) {
      setErrorMessage('Name must be at least 4 characters long.');
      return;
    }

    if (!email.includes('@gmail.com')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      await register({ name, email, password });
      setSuccessMessage('Registration successful! Redirecting to login...');
      setErrorMessage('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (e) => {
    const input = e.target.previousElementSibling;
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    e.target.classList.toggle('fa-eye');
    e.target.classList.toggle('fa-eye-slash');
  };

  return (
    <form className={styles.register_form} onSubmit={handleSubmit}>
      <h1>Register</h1>
      <div className={styles.form_group}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={user.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.form_group}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.form_group}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={user.password}
          onChange={handleChange}
          required
        />
        <i className={`fa fa-eye ${styles.password_toggle}`} onClick={togglePasswordVisibility}></i>
      </div>
      <div className={styles.form_group}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={user.confirmPassword}
          onChange={handleChange}
          required
        />
        <i className={`fa fa-eye ${styles.password_toggle}`} onClick={togglePasswordVisibility}></i>
      </div>
      <button type="submit" className={styles.register_btn}>Register</button>
    </form>
  );
};

export default Form;
