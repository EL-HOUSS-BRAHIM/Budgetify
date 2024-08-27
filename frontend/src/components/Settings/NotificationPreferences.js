import React from 'react';
import styles from '../../css/settings/NotificationPreferences.module.css';

const NotificationPreferences = ({ user, handleInputChange, updateUserSettings }) => {
  return (
    <section className={styles.notification_preferences}>
      <h2><i className="fas fa-bell"></i> Notification Preferences</h2>
      <form onSubmit={updateUserSettings}>
        <div className={styles.form_group}>
          <label>
            <input
              type="checkbox"
              name="email_notifications"
              checked={user.email_notifications}
              onChange={handleInputChange}
            />
            Email Notifications
          </label>
        </div>
        <div className={styles.form_group}>
          <label>
            <input
              type="checkbox"
              name="push_notifications"
              checked={user.push_notifications}
              onChange={handleInputChange}
            />
            Push Notifications
          </label>
        </div>
        <div className={styles.form_group}>
          <label>
            <input
              type="checkbox"
              name="sms_notifications"
              checked={user.sms_notifications}
              onChange={handleInputChange}
            />
            SMS Notifications
          </label>
        </div>
        <button type="submit" className={styles.submit_btn}>
          Save Preferences
        </button>
      </form>
    </section>
  );
};

export default NotificationPreferences;
