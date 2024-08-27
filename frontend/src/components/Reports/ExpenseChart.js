import React, { forwardRef, useEffect, useCallback } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns'; // Just import the adapter package
import styles from '../../css/Reports/ExpensesChart.module.css';

const ExpenseChart = forwardRef(({ expenses }, ref) => {
    const createChart = useCallback(() => {
        if (expenses && ref.current) {
            const ctx = ref.current.getContext('2d');

            if (ref.current.chart) {
                ref.current.chart.destroy();
            }

            const processData = (expenses) => {
                const labels = [];
                const data = [];

                expenses.forEach(expense => {
                    const date = new Date(expense.date).toLocaleDateString();
                    const index = labels.indexOf(date);
                    if (index === -1) {
                        labels.push(date);
                        data.push(parseFloat(expense.amount));
                    } else {
                        data[index] += parseFloat(expense.amount);
                    }
                });

                return { labels, data };
            };

            const { labels, data } = processData(expenses);

            ref.current.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Expenses',
                        data: data,
                        backgroundColor: '#FF6384'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Expenses Breakdown'
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => `$${value}`
                            }
                        }
                    }
                }
            });
        }
    }, [expenses, ref]);

    useEffect(() => {
        createChart();
    }, [createChart]);

    return (
        <section className={styles.chart_container}>
            <canvas id="expensesChart" ref={ref}></canvas>
        </section>
    );
});

export default ExpenseChart;
