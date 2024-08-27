import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserSettings } from '../utils/api';
import { showNotification } from '../utils/notifications';

function Settings() {
  const [settings, setSettings] = useState({
    currency: 'USD',
    theme: 'light',
    notificationFrequency: 'daily'
  });

  useEffect(() => {
    fetchUserSettings().then(setSettings);
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserSettings(settings);
      showNotification('Settings updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update settings', 'error');
    }
  };

  return (
    <div className="settings">
      <h2>User Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="currency">Currency:</label>
          <select
            id="currency"
            name="currency"
            value={settings.currency}
            onChange={handleChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label htmlFor="theme">Theme:</label>
          <select
            id="theme"
            name="theme"
            value={settings.theme}
            onChange={handleChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label htmlFor="notificationFrequency">Notification Frequency:</label>
          <select
            id="notificationFrequency"
            name="notificationFrequency"
            value={settings.notificationFrequency}
            onChange={handleChange}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}

export default Settings;