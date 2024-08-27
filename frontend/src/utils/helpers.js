export const calculateMonthlyBudget = (budgets, month, year) => {
  return budgets.reduce((total, budget) => {
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);

    if (
      (startDate.getMonth() + 1 <= month && startDate.getFullYear() <= year) &&
      (endDate.getMonth() + 1 >= month && endDate.getFullYear() >= year)
    ) {
      return total + budget.amount;
    }

    return total;
  }, 0);
};
export const sortExpensesByAmount = (expenses) => {
  return expenses.sort((a, b) => b.amount - a.amount);
};

export const calculateMonthlyExpenses = (expenses, month, year) => {
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
  });

  return monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
};


export const calculateBudgetCategoryTotals = (budgets) => {
  return budgets.reduce((totals, budget) => {
    const { category, amount } = budget;
    if (!totals[category]) {
      totals[category] = 0;
    }
    totals[category] += amount;
    return totals;
  }, {});
};
export const calculateCategoryPercentage = (categoryBudget, totalBudget) => {
  if (totalBudget === 0) return '0%';
  const percentage = (categoryBudget / totalBudget) * 100;
  return `${percentage.toFixed(2)}%`;
};
export const calculateRemainingBudget = (totalBudget, totalExpenses) => {
  return totalBudget - totalExpenses;
};
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
export const downloadDataAsFile = (data, filename) => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
export const filterExpensesByDateRange = (expenses, startDate, endDate) => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
  });
};
export const calculateExpenseCategoryTotals = (expenses) => {
  return expenses.reduce((totals, expense) => {
    const { category, amount } = expense;
    if (!totals[category]) {
      totals[category] = 0;
    }
    totals[category] += amount;
    return totals;
  }, {});
};
export const getExpenseCategories = (expenses) => {
  return [...new Set(expenses.map(expense => expense.category))];
};
export const calculateTotalExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const { category } = expense;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};
export const groupExpensesByDate = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const date = formatDate(expense.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});
};
export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};
export const calculateTotalBudget = (budgets) => {
  return budgets.reduce((total, budget) => total + budget.total, 0);
}