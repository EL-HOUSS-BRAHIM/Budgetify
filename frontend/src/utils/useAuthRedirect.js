// src/utils/useAuthRedirect.js

import { useNavigate } from 'react-router-dom';
import { removeToken } from './auth';

const useAuthRedirect = () => {
    const navigate = useNavigate();

    const handleAuthError = () => {
        removeToken();
        navigate('/login');
    };

    return handleAuthError;
};

export default useAuthRedirect;
