import React from 'react';
import styles from '../../css/settings/AccountDeletion.module.css';

const AccountDeletion = ({ handleDeleteAccount }) => {
  return (
    <section className={styles.account_deletion}>
      <h2><i className="fas fa-trash-alt"></i> Delete Account</h2>
      <button onClick={handleDeleteAccount} className={styles.delete_btn}>
        Delete My Account
      </button>
    </section>
  );
};

export default AccountDeletion;
