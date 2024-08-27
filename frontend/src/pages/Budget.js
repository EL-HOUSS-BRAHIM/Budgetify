import React, { useState, useEffect } from 'react';
import { fetchBudgetData, createBudget, updateBudget, deleteBudget } from '../utils/api';
import DMT from '../components/DMT/DMT';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BudgetOverview from '../components/Budget/BudgetOverview';
import BudgetCategories from '../components/Budget/BudgetCategories';
import Modal from '../components/Budget/Modal';
import setActivePage from '../components/setActive';
import Loader from '../components/Loader';
import '../css/Budget/Budgets.css';

const BudgetPage = () => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [categories, setCategories] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    document.body.classList.add('budget-page');

    return () => {
      document.body.classList.remove('budget-page');
    };
  }, []);

  useEffect(() => {
    setActivePage('Budgets_Page');

    const loadData = async () => {
      try {
        const budgetData = await fetchBudgetData();
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed, so January is 0

        const monthlyData = budgetData.filter(item => {
          const itemDate = new Date(item.start_date);
          return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        });

        const total = monthlyData.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        setTotalBudget(total);
        setCategories(monthlyData);
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setLoading(false); // Stop loading when data is fetched
      }
    };
    loadData();
  }, []);

  const handleModalOpen = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const amount = parseFloat(formData.get('amount'));
    const name = formData.get('name') || modalData.category;
    const start_date = formData.get('startDate');
    const end_date = formData.get('endDate');

    const postData = {
      amount: amount.toFixed(2),
      category: name,
      start_date,
      end_date,
    };

    try {
      setLoading(true); // Start loading when form is submitted

      if (modalType === 'total') {
        await updateBudget('total', postData);
        // Update total budget based on the current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const updatedData = await fetchBudgetData();
        const monthlyData = updatedData.filter(item => {
          const itemDate = new Date(item.start_date);
          return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        });
        const updatedTotal = monthlyData.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        setTotalBudget(updatedTotal);
      } else if (modalType === 'category') {
        if (modalData.id) {
          await updateBudget(modalData.id, postData);
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === modalData.id ? { ...cat, amount, category: name, start_date, end_date } : cat
            )
          );
        } else {
          const newCategory = await createBudget(postData);
          setCategories((prev) => [...prev, { ...newCategory, spent: 0 }]);
        }
      }
    } catch (error) {
      console.error('Error saving budget data:', error);
    } finally {
      setLoading(false); // Stop loading after form submission
      handleModalClose();
    }
  };
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        await deleteBudget(categoryId);
        setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
        
        // Recalculate total budget
        const updatedTotal = categories.reduce((acc, cat) => {
          return cat.id !== categoryId ? acc + parseFloat(cat.amount) : acc;
        }, 0);
        setTotalBudget(updatedTotal);
      } catch (error) {
        console.error('Error deleting budget category:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <DMT />
      <Header />
      {loading ? (
        <Loader /> // Display loader if loading is true
      ) : (
        <>
          <main>
            <BudgetOverview totalBudget={totalBudget} handleModalOpen={handleModalOpen} />
            <BudgetCategories categories={categories} totalBudget={totalBudget} handleModalOpen={handleModalOpen} handleDeleteCategory={handleDeleteCategory} />
          </main>
        </>
      )}
      <Footer />
      {showModal && (
        <Modal
          modalType={modalType}
          modalData={modalData}
          handleFormSubmit={handleFormSubmit}
          handleModalClose={handleModalClose}
        />
      )}
    </>
  );
};

export default BudgetPage;
