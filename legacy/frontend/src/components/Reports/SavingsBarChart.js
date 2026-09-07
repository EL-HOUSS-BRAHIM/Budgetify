import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from '../../css/Reports/SavingsBarChart.module.css';

const SavingsBarChart = ({ budgets, expenses }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        const budgetSum = budgets.reduce((acc, budget) => acc + parseFloat(budget.amount), 0);
        const expenseSum = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        const netSavings = budgetSum - expenseSum;

        const data = {
            labels: ['Net Savings'],
            datasets: [{
                label: 'Amount',
                data: [netSavings],
                backgroundColor: '#4BC0C0',
            }]
        };

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Net Savings'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `$${value}`
                        }
                    }
                },
                responsive: true
            }
        });
    }, [budgets, expenses]);

    return (
        <section className={styles.chart_container}>
            <canvas ref={chartRef}></canvas>
        </section>
    );
};

export default SavingsBarChart;
