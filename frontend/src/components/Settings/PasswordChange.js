import React from 'react';
import styles from '../../css/settings/PasswordChange.module.css';

const PasswordChange = ({
  newPassword,
  handleNewPasswordChange,
  confirmPassword,
  setConfirmPassword,
  passwordStrength,
  handlePasswordChange
}) => {
  return (
    <section className={styles.password_change}>
      <h2><i className="fas fa-lock"></i> Change Password</h2>
      <form onSubmit={handlePasswordChange}>
        <div className={styles.form_group}>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
          {passwordStrength && <p className={styles.password_strength}>{passwordStrength}</p>}
        </div>
        <div className={styles.form_group}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submit_btn}>
          Change Password
        </button>
      </form>
    </section>
  );
};

export default PasswordChange;
