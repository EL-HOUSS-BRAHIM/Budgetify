import React from 'react';
import styles from '../../css/Budget/Modal.module.css';

const Modal = ({ modalType, modalData, handleFormSubmit, handleModalClose }) => (
  <div id={styles.modal} className={styles.modal} style={{ display: 'block' }}>
    <div className={styles.modal_content}>
      <span className={styles.close} onClick={handleModalClose}>&times;</span>
      <h2>{modalType === 'total' ? 'Edit Total Budget' : 'Add/Edit Category'}</h2>
      <form id="modal-form" onSubmit={handleFormSubmit}>
        <div className={styles.form_group}>
          <label htmlFor="modal-input">Amount:</label>
          <input type="number" id="modal-input" name="amount" defaultValue={modalData.amount || ''} required />
        </div>
        {modalType === 'category' && (
          <>
            <div className={styles.form_group}>
              <label htmlFor="category-name">Category Name:</label>
              <input type="text" id="category-name" name="name" defaultValue={modalData.category || ''} required />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="start-date">Start Date:</label>
              <input type="date" id="start-date" name="startDate" defaultValue={modalData.startDate || ''} required />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="end-date">End Date:</label>
              <input type="date" id="end-date" name="endDate" defaultValue={modalData.endDate || ''} required />
            </div>
          </>
        )}
        <button type="submit" className={styles.add_btn}>Save</button>
      </form>
    </div>
  </div>
);

export default Modal;