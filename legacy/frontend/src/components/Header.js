import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import styles from '../css/Header.module.css';
import { fetchUserProfile } from '../utils/api';

function Navbar() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getAvatarSrc = (avatar) => {
    if (avatar && avatar.startsWith('<svg')) {
      return avatar;
    }
    return avatar ? `data:image/png;base64,${avatar}` : null;
  };

  const renderAvatar = () => {
    if (!profile || !profile.avatar) {
      return <div className={styles.placeholder_avatar}></div>;
    }

    const avatarSrc = getAvatarSrc(profile.avatar);

    if (avatarSrc && avatarSrc.startsWith('<svg')) {
      return (
        <div
          className={styles.avatar}
          dangerouslySetInnerHTML={{ __html: avatarSrc }}
        />
      );
    } else {
      return (
        <img
          src={avatarSrc || "/default-avatar.jpg"}
          alt="User Avatar"
          className={styles.avatar}
        />
      );
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <i className="fas fa-chart-pie"></i>
        <span>Budget Manager</span>
      </div>
      <div className={`${styles.hamburger} ${isMenuOpen ? styles.hamburger_open : ''}`} onClick={toggleMenu}>
        <div className={styles.hamburger_line}></div>
        <div className={styles.hamburger_line}></div>
        <div className={styles.hamburger_line}></div>
      </div>
      <nav className={`${styles.nav} ${isMenuOpen ? styles.nav_open : ''}`}>
        <ul className={styles.nav_list}>
          <li><Link to="/dashboard" id="Dashboard_Page" onClick={toggleMenu}>Dashboard</Link></li>
          <li><Link to="/expenses" id="Expenses_Page" onClick={toggleMenu}>Expenses</Link></li>
          <li><Link to="/budget" id="Budgets_Page" onClick={toggleMenu}>Budgets</Link></li>
          <li><Link to="/reports" id="Reports_Page" onClick={toggleMenu}>Reports</Link></li>
        </ul>
      </nav>
      {loading ? (
        <div className={styles.placeholder_avatar}></div>
      ) : (
        <div className={styles.user_profile}>
          {renderAvatar()}
          <div className={styles.dropdown}>
            <button className={styles.dropbtn}>
              {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
            </button>
            <div className={styles.dropdown_content}>
              <Link to="/settings" onClick={toggleMenu}><i className="fas fa-cog"></i> Settings</Link>
              <button onClick={handleLogout} className={styles.logout_btn}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
