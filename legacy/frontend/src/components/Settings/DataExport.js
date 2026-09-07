import React from 'react';
import styles from '../../css/settings/DataExport.module.css';

const DataExport = ({ handleExportData }) => {
  return (
    <section className={styles.data_export}>
      <h2><i className="fas fa-download"></i> Export Data</h2>
      <button onClick={handleExportData} className={styles.export_btn}>
        Export Data
      </button>
    </section>
  );
};

export default DataExport;
