import React from 'react';
import { formatPercentage } from '../../utils/helpers';
import styles from '../../css/Dashboard/BudgetSummary.module.css';

const BudgetSummary = ({ totalBudget, totalExpenses }) => {
  let percentageUsed;

  if (totalBudget === 0 && totalExpenses === 0) {
    percentageUsed = "0%"; // No budget and no expenses
  } else if (totalBudget === 0 && totalExpenses > 0) {
    percentageUsed = "100%"; // Expenses exist, but no budget
  } else {
    percentageUsed = formatPercentage((totalExpenses / totalBudget) * 100);
  }

  return (
    <section className={styles.budget_summary}>
      <h2>Budget Summary</h2>
      <div className={styles.budget_progress}>
        <div className={styles.progress_bar}>
          <div className={styles.progress} style={{ width: percentageUsed }}></div>
        </div>
        <p>{percentageUsed} of budget used</p>
      </div>
    </section>
  );
};

export default BudgetSummary;
