import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import styles from '../../css/Dashboard/SpendingPatterns.module.css';

const SpendingPatterns = ({ chartData }) => {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (chartData && canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Spending Patterns'
            }
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  if (!chartData) {
    return null;
  }

  return (
    <section className={styles.charts}>
      <h2>Spending Patterns</h2>
      <div className={styles.chart}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </section>
  );
};

export default SpendingPatterns;