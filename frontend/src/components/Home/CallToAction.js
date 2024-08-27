import React from 'react';
import styles from '../../css/Home/CallToAction.module.css'; // Import the CSS module

const CallToAction = () => {
  return (
    <section className={styles.cta}>
      <h2>Ready to Take Control of Your Finances?</h2>
      <button className={styles.cta_btn}>Join Now</button>
    </section>
  );
};

export default CallToAction;
