import React, { useState, useEffect, useRef } from 'react';
import { fetchExpenses, addExpense, deleteExpense, updateExpense } from '../utils/api';
import { calculateExpenseCategoryTotals } from '../utils/helpers';
import Chart from 'chart.js/auto';
import Header from '../components/Header';
import Footer from '../components/Footer';
import setActivePage from '../components/setActive';
import ExpenseList from '../components/Expense/ExpenseList';
import AddExpenseForm from '../components/Expense/AddExpenseForm';
import ExpenseChart from '../components/Expense/ExpenseChart';
import Loader from '../components/Loader';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    date: '',
    category: '',
    description: '',
    amount: ''
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('expense-page');

    return () => {
      document.body.classList.remove('expense-page');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setActivePage('Expense_Page');
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, newExpense);
        setEditingExpense(null);
      } else {
        await addExpense(newExpense);
      }
      setNewExpense({
        date: '',
        category: '',
        description: '',
        amount: ''
      });
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error adding/updating expense:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (id) => {
    const expenseToEdit = expenses.find(expense => expense.id === id);
    setNewExpense(expenseToEdit);
    setEditingExpense(expenseToEdit);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        const categoryTotals = calculateExpenseCategoryTotals(expenses);

        chartRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
              data: Object.values(categoryTotals),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Expense Breakdown by Category'
              }
            }
          }
        });
      }
    }
  }, [expenses]);

  return (
    <>
      <Header />
      {loading ? (
        <Loader /> // Display loader if loading is true
      ) : (
        <main className="main">
          <ExpenseList expenses={expenses} handleEdit={handleEdit} handleDelete={handleDelete} />
          <AddExpenseForm newExpense={newExpense} handleInputChange={handleInputChange} handleSubmit={handleSubmit} editingExpense={editingExpense} />
          <ExpenseChart canvasRef={canvasRef} />
        </main>
      )}
      <Footer />
    </>
  );
};

export default ExpensesPage;
