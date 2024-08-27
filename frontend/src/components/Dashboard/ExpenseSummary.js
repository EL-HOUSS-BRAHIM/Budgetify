import React, { useState } from 'react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import styles from '../../css/Dashboard/ExpenseSummary.module.css';

const ExpenseSummary = ({ expenses }) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const toggleFilters = () => {
    setFiltersVisible(prevState => !prevState);
  };

  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  const applyFilters = () => {
    let filteredExpenses = expenses;

    if (filterYear) {
      filteredExpenses = filteredExpenses.filter(expense =>
        new Date(expense.date).getFullYear() === parseInt(filterYear)
      );
    }

    if (filterMonth) {
      filteredExpenses = filteredExpenses.filter(expense =>
        new Date(expense.date).getMonth() + 1 === parseInt(filterMonth)
      );
    }

    return filteredExpenses;
  };

  const filteredExpenses = applyFilters();
  const sortedExpenses = filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className={styles.expense_summary}>
      <h2>Expense Summary</h2>
      <div 
        className={`${styles.toggle_button} ${filtersVisible ? 'fas fa-times' : 'fas fa-filter'}`} 
        onClick={toggleFilters}
      />

      {filtersVisible && (
        <div className={styles.filters}>
          <label htmlFor="filterYear">Year:</label>
          <input
            type="number"
            id="filterYear"
            placeholder="YYYY"
            value={filterYear}
            onChange={handleYearChange}
          />
          
          <label htmlFor="filterMonth">Month:</label>
          <input
            type="number"
            id="filterMonth"
            placeholder="MM"
            value={filterMonth}
            onChange={handleMonthChange}
          />
          
          <button className={styles.apply_button} onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      )}

      <div className={styles.table_container}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense, index) => (
                <tr key={index}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.category}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No info at the moment. Click here to add.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ExpenseSummary;
