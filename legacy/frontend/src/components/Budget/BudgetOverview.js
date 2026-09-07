import React from 'react';
import styles from '../../css/Budget/BudgetOverview.module.css';
import { formatCurrency } from '../../utils/helpers';

const BudgetOverview = ({ totalBudget, handleModalOpen }) => (
  <section className={styles.budget_overview}>
    <h1>Budget Overview</h1>
    <div className={styles.total_budget}>
      <h2>Total Monthly Budget</h2>
      <p className={styles.amount}>{formatCurrency(totalBudget)}</p>
      </div>
  </section>
);

export default BudgetOverview;
