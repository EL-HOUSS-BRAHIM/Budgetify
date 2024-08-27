import React, { useEffect, useState, useMemo } from 'react';
import { fetchBudgetData, fetchExpenses, getNotifications } from '../utils/api';
import { calculateMonthlyBudget, calculateMonthlyExpenses, calculateRemainingBudget, calculateExpenseCategoryTotals, getExpenseCategories } from '../utils/helpers';
import { showNotification } from '../utils/notifications';
import Header from '../components/Header';
import Footer from '../components/Footer';
import setActivePage from '../components/setActive';
import Overview from '../components/Dashboard/Overview';
import ExpenseSummary from '../components/Dashboard/ExpenseSummary';
import BudgetSummary from '../components/Dashboard/BudgetSummary';
import SpendingPatterns from '../components/Dashboard/SpendingPatterns';
import Notifications from '../components/Dashboard/Notifications';
import Loader from '../components/Loader';
import '../css/Dashboard/Dashboard.css';

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  useEffect(() => {
    setActivePage('Dashboard_Page');

    const fetchData = async () => {
      try {
        const budgetData = await fetchBudgetData();
        setBudgets(budgetData);
        const expenseData = await fetchExpenses();
        setExpenses(expenseData);
        const notificationsData = await getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        showNotification('Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (expenses.length === 0) return null;

    const categoryTotals = calculateExpenseCategoryTotals(expenses);
    const categories = getExpenseCategories(expenses);
    return {
      labels: categories,
      datasets: [{
        label: 'Spending Patterns',
        data: categories.map(category => categoryTotals[category] || 0),
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#ffc107', '#28a745', '#20c997', '#e83e8c']
      }]
    };
  }, [expenses]);

  const totalBudget = calculateMonthlyBudget(budgets, currentMonth, currentYear);
  const totalExpenses = calculateMonthlyExpenses(expenses, currentMonth, currentYear);
  const remainingBudget = calculateRemainingBudget(totalBudget, totalExpenses);

  return (
    <>
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <Overview totalBudget={totalBudget} totalExpenses={totalExpenses} remainingBudget={remainingBudget} />
          <ExpenseSummary expenses={expenses} />
          <BudgetSummary totalBudget={totalBudget} totalExpenses={totalExpenses} />
          <SpendingPatterns chartData={chartData} />
          <Notifications notifications={notifications} />
        </main>
      )}
      <Footer />
    </>
  );
};

export default Dashboard;