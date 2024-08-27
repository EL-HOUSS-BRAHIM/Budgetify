import React from 'react';
import { formatPercentage } from '../../utils/helpers';
import styles from '../../css/Dashboard/BudgetSummary.module.css';
const BudgetSummary = ({ totalBudget, totalExpenses }) => {
  return (
    <section className={styles.budget_summary}>
      <h2>Budget Summary</h2>
      <div className={styles.budget_progress}>
        <div className={styles.progress_bar}>
          <div className={styles.progress} style={{ width: formatPercentage((totalExpenses / totalBudget) * 100) }}></div>
        </div>
        <p>{formatPercentage((totalExpenses / totalBudget) * 100)} of budget used</p>
      </div>
    </section>
  );
};

export default BudgetSummary;
