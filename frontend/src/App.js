import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';
import NotFound from './pages/NotFound';
import CompleteProfile from './components/CompleteProfile';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
