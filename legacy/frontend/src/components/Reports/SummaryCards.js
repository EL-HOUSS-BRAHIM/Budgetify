import React from 'react';
import styles from '../../css/Reports/SummaryCards.module.css';

const SummaryCards = ({ totalExpenses, totalIncome, netSavings }) => {
    return (
        <section className={styles.summary_cards}>
            <div className={styles.summary_card}>
                <h3>Total Expenses</h3>
                <p className="amount">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className={styles.summary_card}>
                <h3>Total Income</h3>
                <p className="amount">${totalIncome.toFixed(2)}</p>
            </div>
            <div className={styles.summary_card}>
                <h3>Net Savings</h3>
                <p className="amount">${netSavings.toFixed(2)}</p>
            </div>
        </section>
    );
};

export default SummaryCards;
