import React from 'react';
import styles from '../../css/settings/ThemeSelection.module.css';

const ThemeSelection = ({ theme, handleThemeChange, handleDarkModeToggle }) => {
  return (
    <section className={styles.theme_selection}>
      <h2><i className="fas fa-palette"></i> Theme Settings</h2>
      <div className={styles.theme_controls}>
        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={() => handleThemeChange('light')}
          />
          Light Mode
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => handleThemeChange('dark')}
          />
          Dark Mode
        </label>
        <div className={styles.dark_mode_toggle}>
          <label htmlFor="dark-mode">Enable Dark Mode</label>
          <input
            type="checkbox"
            id="dark-mode"
            checked={theme === 'dark'}
            onChange={handleDarkModeToggle}
          />
        </div>
      </div>
    </section>
  );
};

export default ThemeSelection;
