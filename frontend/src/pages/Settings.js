import React, { useState, useEffect } from 'react';
import {
  fetchUserProfile,
  updateUserProfile,
  updateUserSettings,
  changePassword,
  exportUserData,
  deleteUserAccount
} from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileInfo from '../components/Settings/ProfileInfo';
import ThemeSelection from '../components/Settings/ThemeSelection';
import NotificationPreferences from '../components/Settings/NotificationPreferences';
import PasswordChange from '../components/Settings/PasswordChange';
import DataExport from '../components/Settings/DataExport';
import AccountDeletion from '../components/Settings/AccountDeletion';
import Loader from '../components/Loader';
import { downloadDataAsFile } from '../utils/helpers';

const Settings = () => {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    currency: 'USD',
    language: 'en',
    timezone: 'GMT',
    two_factor_auth: false,
    login_alerts: false,
    password_expiry: 90,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
  });
  const [theme, setTheme] = useState('light');
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('settings-page');
    return () => {
      document.body.classList.remove('settings-page');
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await fetchUserProfile();
        setUser(userProfile);

        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.body.className = `theme-${savedTheme}`;

        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        document.body.classList.toggle('dark-mode', savedDarkMode);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Failed to load user settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(user);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await changePassword({ newPassword });
      alert('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength('');
    } catch (error) {
      alert('Failed to change password.');
    }
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    let strength = 0;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[$@#&!]+/)) strength += 1;

    switch (strength) {
      case 0: setPasswordStrength(''); break;
      case 1: setPasswordStrength('weak'); break;
      case 2:
      case 3: setPasswordStrength('medium'); break;
      case 4: setPasswordStrength('strong'); break;
      default: setPasswordStrength('');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem('theme', newTheme);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      downloadDataAsFile(data, 'user_data.json');
      alert('Your data has been exported successfully.');
    } catch (error) {
      alert('Failed to export data.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      try {
        await deleteUserAccount();
        alert('Your account has been deleted. You will be logged out now.');
        window.location.href = '/logout';
      } catch (error) {
        alert('Failed to delete account.');
      }
    }
  };

  return (
    <>
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <main id="main-content">
          <ProfileInfo 
            user={user} 
            handleInputChange={handleInputChange} 
            handleProfileSubmit={handleProfileSubmit} 
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
          <ThemeSelection 
            theme={theme}
            handleThemeChange={handleThemeChange}
            handleDarkModeToggle={handleDarkModeToggle}
          />
          <NotificationPreferences 
            user={user} 
            handleInputChange={handleInputChange}
            updateUserSettings={updateUserSettings}
          />
          <PasswordChange 
            newPassword={newPassword}
            handleNewPasswordChange={handleNewPasswordChange}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordStrength={passwordStrength}
            handlePasswordChange={handlePasswordChange}
          />
          <DataExport handleExportData={handleExportData} />
          <AccountDeletion handleDeleteAccount={handleDeleteAccount} />
        </main>
      )}
      <Footer />
    </>
  );
};

export default Settings;
