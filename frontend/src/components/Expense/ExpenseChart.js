import React from 'react';
import styles from '../../css/Expense/ExpensesChart.module.css';

const ExpenseChart = ({ canvasRef }) => {
  return (
    <section className={styles.chart}>
      <h2>Expense Breakdown</h2>
      <canvas ref={canvasRef} id="expenseChart"></canvas>
    </section>
  );
};

export default ExpenseChart;
