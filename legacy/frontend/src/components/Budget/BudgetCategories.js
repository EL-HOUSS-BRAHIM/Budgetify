import React from 'react';
import styles from '../../css/Budget/BudgetCategories.module.css';
import { calculateCategoryPercentage, formatCurrency } from '../../utils/helpers';

const BudgetCategories = ({ categories, totalBudget, handleModalOpen, handleDeleteCategory }) => (
  <section className={styles.budget_categories}>
    <h2>Budget Categories</h2>
    <div className={styles.category_list_container}>
      <div className={styles.category_list}>
        {categories.map((category) => {
          const percentage = calculateCategoryPercentage(category.amount, totalBudget);
          return (
            <div key={category.id} className={styles.category_item}>
              <h3>{category.category}</h3>
              <div className={styles.progress_bar}>
                <div className={styles.progress} style={{ width: `${percentage}%` }}></div>
              </div>
              <p>{formatCurrency(category.amount)}</p>
              <p className={styles.date_range}>
                {category.start_date && category.end_date
                  ? `From: ${category.start_date} To: ${category.end_date}`
                  : 'No date range available'}
              </p>
              <div className={styles.category_buttons}>
                <button className={styles.edit_category_btn} onClick={() => handleModalOpen('category', category)}>Edit</button>
                <button className={styles.delete_category_btn} onClick={() => handleDeleteCategory(category.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <button className={styles.add_btn} onClick={() => handleModalOpen('category')}>Add New Category</button>
  </section>
);

export default BudgetCategories;