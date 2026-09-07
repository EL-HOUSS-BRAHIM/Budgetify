import React, { useState, useEffect } from 'react';
import Header from '../components/Register/Header';
import Footer from '../components/Register/Footer';
import Form from '../components/Register/Form';
import SocialRegister from '../components/Register/SocialRegister';
import '../css/Register/Register.css';
import Loader from '../components/Loader';

function Register() {
  const [loading, setLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('register-page');

    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // Simulate API call
      // await apiCall(formData);
      setSuccessMessage('Registration successful!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
      setSuccessMessage('');
    } finally {
      setLoading(false); // Stop loading after the operation is complete
    }
  };

  return (
    <>
      <div className="container">
        <Header />
        {loading ? (
          <Loader />
        ) : (
          <main>
            <Form setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} onSubmit={handleSubmit} />
            {errorMessage && <div className="error_message">{errorMessage}</div>}
            {successMessage && <div className="success_message">{successMessage}</div>}
            <SocialRegister />
          </main>
        )}
        <Footer />
      </div>
    </>
  );
}

export default Register;
