import React from 'react';
import styles_social from '../../css/Login/socialLogin.module.css';

function SocialLogin() {
  return (
    <div className={styles_social.social_login}>
      <p>Or login with:</p>
      <button className={styles_social.google_btn}>
        <i className="fab fa-google"></i> Google
      </button>
      <button className={styles_social.facebook_btn}>
        <i className="fab fa-facebook-f"></i> Facebook
      </button>
    </div>
  );
}

export default SocialLogin;
