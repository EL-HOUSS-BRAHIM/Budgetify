import React from 'react';
import styles from '../../css/Expense/ExpensesForm.module.css';

const AddExpenseForm = ({ newExpense, handleInputChange, handleSubmit, editingExpense }) => {
  return (
    <section className={styles.add_expense}>
      <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
      <form id="add-expense-form" onSubmit={handleSubmit}>
        <div className={styles.form_group}>
          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" value={newExpense.date} onChange={handleInputChange} required />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={newExpense.category} onChange={handleInputChange} required>
            <option value="">Select a category</option>
            <option value="groceries">Groceries</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="transportation">Transportation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.form_group}>
          <label htmlFor="description">Description</label>
          <input type="text" id="description" name="description" value={newExpense.description} onChange={handleInputChange} required />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="amount">Amount</label>
          <input type="number" id="amount" name="amount" value={newExpense.amount} onChange={handleInputChange} step="0.01" required />
        </div>
        <button type="submit" className={styles.add_btn}>{editingExpense ? 'Update Expense' : 'Add Expense'}</button>
      </form>
    </section>
  );
};

export default AddExpenseForm;
