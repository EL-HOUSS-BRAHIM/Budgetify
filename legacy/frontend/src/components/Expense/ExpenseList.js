import React from 'react';
import styles from '../../css/Expense/ExpensesList.module.css';

const ExpenseList = ({ expenses, handleEdit, handleDelete }) => {
  // Sort expenses from newest to oldest
  const sortedExpenses = expenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className={styles.expense_list}>
      <h1>Expenses</h1>
      <div className={styles.table_container}>
        <table id="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.date}</td>
                  <td>{expense.category}</td>
                  <td>{expense.description}</td>
                  <td>${expense.amount.toFixed(2)}</td>
                  <td>
                    <button className={styles.edit_btn} onClick={() => handleEdit(expense.id)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className={styles.delete_btn} onClick={() => handleDelete(expense.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div id="total-expenses">
        Total: ${sortedExpenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}
      </div>
    </section>
  );
};

export default ExpenseList;
