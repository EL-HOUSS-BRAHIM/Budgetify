import React from 'react';
import styles from '../../css/Home/Features.module.css'; // Import the CSS module

const Features = () => {
  return (
    <section className={styles.features} id="features">
      <h2>Features</h2>
      <div className={styles.feature_grid}>
        <div className={styles.feature}>
          <i className="fas fa-chart-line fa-3x"></i>
          <h3>Track Expenses</h3>
          <p>Easily log and categorize your expenses</p>
        </div>
        <div className={styles.feature}>
          <i className="fas fa-piggy-bank fa-3x"></i>
          <h3>Set Budgets</h3>
          <p>Create and manage budgets for different categories</p>
        </div>
        <div className={styles.feature}>
          <i className="fas fa-chart-pie fa-3x"></i>
          <h3>Visualize Data</h3>
          <p>View your financial data through intuitive charts</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
