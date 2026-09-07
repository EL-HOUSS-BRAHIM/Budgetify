import React from 'react';
import styles from '../../css/Dashboard/Notifications.module.css';

const Notifications = ({ notifications }) => (
  <section className={styles.notifications}>
    <h2>Notifications</h2>
    <ul>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <li key={index}>{notification.message}</li>
        ))
      ) : (
        <li>No info at the moment.</li>
      )}
    </ul>
  </section>
);

export default Notifications;
