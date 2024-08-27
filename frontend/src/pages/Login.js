import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../components/Login/LoginHeader';
import LoginFooter from '../components/Login/LoginFooter';
import LoginForm from '../components/Login/LoginForm';
import SocialLogin from '../components/Login/socialLogin';
import { login } from '../utils/auth';
import Loader from '../components/Loader';
import '../css/Login/Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');

    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="container">
        {loading ? (
          <Loader />
        ) : (
          <>
            <LoginHeader />
            <main>
              <LoginForm
                onSubmit={handleSubmit}
                credentials={credentials}
                handleChange={handleChange}
              />
              <SocialLogin />
            </main>
            <LoginFooter />
          </>
        )}
      </div>
    </>
  );
}

export default Login;
