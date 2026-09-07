import React from 'react';
import styles from '../css/Footer.module.css'

function Footer() {
  return (
    <>
      <footer className={styles.das_footer}>
        <p>&copy; 2024 Budget Manager. All rights reserved.</p>
        <div class={styles.footer_links}>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-Of-Service">Terms of Service</a>
            <a href="/Support">Support</a>
        </div>
        <div class={styles.social_icons}>
            <a href="https://www.facebook.com/brahim.el.102977" title="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.facebook.com/brahim.el.102977" title="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://www.linkedin.com/in/brahim-el-houss" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="https://github.com/EL-HOUSS-BRAHIM" title="Github"><i class="fab fa-github"></i></a>
        </div>
    </footer>
    </>
  );
}

export default Footer;
