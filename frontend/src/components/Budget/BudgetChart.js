import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function BudgetChart({ data }) {
  // Check if data is null or undefined
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [{
      data: data.map(item => item.amount),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Budget Breakdown'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';

            if (label) {
              label += ': ';
            }

            label += `$${context.raw}`;
            return label;
          },
          footer: function(context) {
            let total = 0;
            context.forEach(function(tooltipItem) {
              total += tooltipItem.raw;
            });
            return `Total: $${total}`;
          }
        }
      }
    }
  };

  return (
    <div className={styles.budget_chart}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default BudgetChart;
