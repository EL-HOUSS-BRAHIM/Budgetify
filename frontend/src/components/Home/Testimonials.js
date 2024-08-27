import React from 'react';
import styles from '../../css/Home/Testimonials.module.css'; // Import the CSS module

const Testimonials = () => {
  return (
    <section className={styles.testimonials}>
      <h2>What Our Users Say</h2>
      <div className={styles.testimonials_container}>
        <div className={styles.testimonial}>
          <img src="https://via.placeholder.com/100" alt="User 1" />
          <blockquote>"This app has completely changed how I manage my finances!"</blockquote>
          <p>- Jane Doe</p>
        </div>
        <div className={styles.testimonial}>
          <img src="https://via.placeholder.com/100" alt="User 2" />
          <blockquote>"I've never been so organized with my money before!"</blockquote>
          <p>- John Smith</p>
        </div>
        <div className={styles.testimonial}>
          <img src="https://via.placeholder.com/100" alt="User 3" />
          <blockquote>"The visualizations make it easy to understand my spending habits."</blockquote>
          <p>- Emily Johnson</p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;