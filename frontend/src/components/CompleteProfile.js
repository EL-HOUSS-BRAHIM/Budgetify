import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserProfile } from '../utils/api'; // Adjusted the API function for POST request
import styles from '../css/CompleteProfile.module.css';

const CompleteProfile = () => {
    const [user, setUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        currency: 'USD',
        language: 'en',
        timezone: 'GMT',
        two_factor_auth: false,
        login_alerts: false,
        password_expiry: 90,
        avatar: '',
    });
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUser((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a FileReader object
            const reader = new FileReader();

            // Set up the FileReader onload event handler
            reader.onload = (event) => {
                setUser(prevState => ({
                    ...prevState,
                    avatar: event.target.result // This will be a data URL representing the file
                }));
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUserProfile(user); // Using the POST request to create the profile
            navigate('/dashboard'); // Redirect to the dashboard after successful profile creation
        } catch (err) {
            setError('There was an error creating your profile. Please try again.');
        }
    };

    return (
        <section className={styles.profile_info}>
            <h1><i className="fas fa-user"></i> Profile Information</h1>
            <div className={styles.avatar_container}>
                <img
                    src={user.avatar || "/default-avatar.jpg"}
                    alt={`${user.first_name}'s profile`}
                    className={styles.profile_picture}
                    id="profilePicture"
                />
                <input
                    type="file"
                    id="profilePictureUpload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <button
                    className={styles.upload_btn}
                    onClick={() => document.getElementById('profilePictureUpload').click()}
                >
                    Upload New Picture
                </button>
            </div>

            <form id="profile-form" className={styles.multi_step_form} onSubmit={handleProfileSubmit}>
                {currentStep === 1 && (
                    <div className={styles.step} id="step1">
                        <h2>Personal Information</h2>
                        <div className={styles.form_group}>
                            <label htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={user.first_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={user.last_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className={styles.step} id="step2">
                        <h2>Account Preferences</h2>
                        <div className={styles.form_group}>
                            <label htmlFor="currency">Preferred Currency</label>
                            <select
                                id="currency"
                                name="currency"
                                value={user.currency}
                                onChange={handleInputChange}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="JPY">JPY</option>
                            </select>
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="language">Preferred Language</label>
                            <select
                                id="language"
                                name="language"
                                value={user.language}
                                onChange={handleInputChange}
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="timezone">Timezone</label>
                            <select
                                id="timezone"
                                name="timezone"
                                value={user.timezone}
                                onChange={handleInputChange}
                            >
                                <option value="GMT">GMT (Greenwich Mean Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                            </select>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className={styles.step} id="step3">
                        <h2>Security Settings</h2>
                        <div className={styles.form_group}>
                            <label htmlFor="two_factor_auth">
                                <input
                                    type="checkbox"
                                    id="two_factor_auth"
                                    name="two_factor_auth"
                                    checked={user.two_factor_auth}
                                    onChange={handleInputChange}
                                />
                                Enable Two-Factor Authentication
                            </label>
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="login_alerts">
                                <input
                                    type="checkbox"
                                    id="login_alerts"
                                    name="login_alerts"
                                    checked={user.login_alerts}
                                    onChange={handleInputChange}
                                />
                                Enable Login Alerts
                            </label>
                        </div>
                        <div className={styles.form_group}>
                            <label htmlFor="password_expiry">Password Expiry (days)</label>
                            <input
                                type="number"
                                id="password_expiry"
                                name="password_expiry"
                                min="30"
                                max="365"
                                value={user.password_expiry}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.form_nav}>
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className={styles.prev_step}
                            onClick={() => setCurrentStep(currentStep - 1)}
                        >
                            Previous
                        </button>
                    )}
                    {currentStep < 3 && (
                        <button
                            type="button"
                            className={styles.next_step}
                            onClick={() => setCurrentStep(currentStep + 1)}
                        >
                            Next
                        </button>
                    )}
                    {currentStep === 3 && (
                        <button type="submit" className={styles.submit_form}>Create Profile</button>
                    )}
                </div>
            </form>
            {error && <p className={styles.error_message}>{error}</p>}
        </section>
    );
};

export default CompleteProfile;
