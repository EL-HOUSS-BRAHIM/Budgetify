import React from 'react';
import styles from '../../css/Home/Hero.module.css'; // Import the CSS module

const Hero = () => {
  return (
    <section className={styles.hero}> {/* Use CSS Module class */}
      <div className={styles.hero_content}>
        <h1>Manage Your Budget Efficiently</h1>
        <p>Track expenses, set budgets, and achieve financial goals</p>
        <button className={styles.cta_btn}>Get Started</button>
      </div>
    </section>
  );
};

export default Hero;
