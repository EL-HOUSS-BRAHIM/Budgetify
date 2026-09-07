import React, { forwardRef, useEffect, useCallback } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { parseISO, format } from 'date-fns';
import styles from '../../css/Reports/TrendChart.module.css';

const TrendChart = forwardRef(({ budgets, expenses }, ref) => {
    const createChart = useCallback(() => {
        if (budgets && expenses && ref.current) {
            const ctx = ref.current.getContext('2d');
            
            if (!ctx) {
                console.error('Canvas context is not available');
                return;
            }

            if (ref.current.chart) {
                ref.current.chart.destroy();
            }

            const processData = (budgets, expenses) => {
                const labels = new Set();
                const budgetDataMap = new Map();
                const expensesDataMap = new Map();

                budgets.forEach(item => {
                    const date = format(parseISO(item.start_date), 'yyyy-MM-dd');
                    labels.add(date);
                    budgetDataMap.set(date, (budgetDataMap.get(date) || 0) + parseFloat(item.amount));
                });

                expenses.forEach(item => {
                    const date = format(parseISO(item.date), 'yyyy-MM-dd');
                    labels.add(date);
                    expensesDataMap.set(date, (expensesDataMap.get(date) || 0) + parseFloat(item.amount));
                });

                const sortedLabels = Array.from(labels).sort((a, b) => new Date(a) - new Date(b));
                const budgetData = sortedLabels.map(label => budgetDataMap.get(label) || 0);
                const expensesData = sortedLabels.map(label => expensesDataMap.get(label) || 0);

                return { labels: sortedLabels, budgetData, expensesData };
            };

            const { labels, budgetData, expensesData } = processData(budgets, expenses);

            ref.current.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Budget',
                            data: budgetData,
                            borderColor: '#36A2EB',
                            fill: false
                        },
                        {
                            label: 'Expenses',
                            data: expensesData,
                            borderColor: '#FF6384',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Budget vs Expenses Trend'
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'dd/MM/yyyy'
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount'
                            },
                            ticks: {
                                callback: value => `$${value}`
                            }
                        }
                    }
                }
            });
        }
    }, [budgets, expenses, ref]);

    useEffect(() => {
        console.log('Budgets:', budgets);
        console.log('Expenses:', expenses);
        createChart();
    }, [createChart, budgets, expenses]);

    return (
        <section className={styles.chart_container}>
            <canvas id="trendChart" ref={ref}></canvas>
        </section>
    );
});

export default TrendChart;