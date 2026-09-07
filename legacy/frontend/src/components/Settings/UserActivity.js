import React from 'react';
import { formatDate } from '../../utils/helpers';
import styles from '../../css/settings/UserActivity.module.css';

const UserActivity = ({ activityLog }) => (
  <section className={styles.user_activity}>
    <h2><i className="fas fa-history"></i> Recent Activity</h2>
    <ul id="activity-log">
      {activityLog.map((activity, index) => (
        <li key={index}>{formatDate(activity.date)} - {activity.description}</li>
      ))}
    </ul>
  </section>
);

export default UserActivity;
