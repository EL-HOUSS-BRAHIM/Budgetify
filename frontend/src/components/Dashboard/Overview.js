import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import styles from '../../css/Dashboard/Overview.module.css';

const Overview = ({ totalBudget, totalExpenses, remainingBudget }) => {
  return (
    <section className={styles.overview}>
      <h2>Overview</h2>
      <div className={styles.summary_cards}>
        <div className={styles.card}>
          <h3>Total Budget</h3>
          <p>{formatCurrency(totalBudget)}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Expenses</h3>
          <p>{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={styles.card}>
          <h3>Remaining</h3>
          <p>{formatCurrency(remainingBudget)}</p>
        </div>
      </div>
    </section>
  );
};

export default Overview;
