// ReportControls.js
import React, { useState } from 'react';
import styles from '../../css/Reports/ReportsControls.module.css';

const ReportControls = ({ generateReport }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    generateReport(startDate, endDate);
  };

  return (
    <form className={styles.report_form} onSubmit={handleSubmit}>
      <h2>Generate Your Financial Report</h2>
      <div className={styles.form_group}>
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className={styles.form_group}>
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <button type="submit" id={styles.generateReportBtn}>Generate Report</button>
    </form>
  );
};

export default ReportControls;