import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from '../../css/Reports/CategoryPieChart.module.css';

const CategoryPieChart = ({ expenses }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        const data = {
            labels: [...new Set(expenses.map(expense => expense.category))],
            datasets: [{
                data: expenses.reduce((acc, expense) => {
                    const index = acc.labels.indexOf(expense.category);
                    acc.data[index] = (acc.data[index] || 0) + parseFloat(expense.amount);
                    return acc;
                }, { labels: [], data: [] }).data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        };

        new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                },
                responsive: true
            }
        });
    }, [expenses]);

    return (
        <section className={styles.chart_container}>
            <canvas ref={chartRef}></canvas>
        </section>
    );
};

export default CategoryPieChart;
