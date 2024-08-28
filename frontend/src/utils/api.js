import axios from 'axios';
import { getToken, logout } from './auth';

const API_URL = 'https://api.brahim-crafts.tech/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.url.includes('/profile') && !config.url.includes('/login') && !config.url.includes('/register')) {
        try {
            const profile = await fetchUserProfile();
            if (!profile || !profile.first_name || !profile.last_name || !profile.email) {
                window.location.href = '/complete-profile';
                return Promise.reject(new Error('Profile incomplete, redirecting to setup page.'));
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                window.location.href = '/complete-profile';
                return Promise.reject(new Error('Profile not found, redirecting to setup page.'));
            }
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        const { status, data } = error.response;

        if (
            status === 401 && (
                (data.message && data.message.includes('expired')) ||
                (data.error && data.error.includes('expired')) ||
                (data.detail && data.detail.includes('expired'))
            )
        ) {
            logout();
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

// Budget-related functions
export const fetchBudgetData = () => api.get('/budget').then(res => res.data);
export const createBudget = (budget) => api.post('/budget', budget).then(res => res.data);
export const updateBudget = (id, budget) => api.put(`/budget/${id}`, budget).then(res => res.data);
export const deleteBudget = (id) => api.delete(`/budget/${id}`).then(res => res.data);

// Category-related functions
export const updateCategory = (id, category) => api.put(`/budget/${id}`, category).then(res => res.data);

// Expense-related functions
export const fetchExpenses = () => api.get('/expenses').then(res => res.data);
export const addExpense = (expense) => api.post('/expenses', expense).then(res => res.data);
export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense).then(res => res.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(res => res.data);

// Notification-related functions
export const getNotifications = async () => {
    const response = await fetch('/api/notifications');
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
};

// Profile-related functions
export const fetchUserProfile = () => api.get('/profile').then(res => res.data);
export const createUserProfile = (profile) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (typeof profile.avatar === 'string' && profile.avatar.startsWith('<svg')) {
        headers['Content-Type'] = 'application/json';
    }

    return api.post('/profile', profile, { headers }).then(res => res.data);
};
export const updateUserProfile = (profile) => api.put('/profile', profile).then(res => res.data);
export const deleteUserProfile = () => api.delete('/profile').then(res => res.data);
export const uploadProfileAvatar = (formData) => api.post('/profile/avatar', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
}).then(res => res.data);
export const getProfileAvatar = () => api.get('/profile/avatar').then(res => res.data);

// User settings-related functions
export const updateUserSettings = (settings) => api.put('/settings', settings).then(res => res.data);
export const changePassword = (passwordData) => api.post('/change-password', passwordData).then(res => res.data);
export const exportUserData = () => api.get('/export-data').then(res => res.data);
export const deleteUserAccount = () => api.delete('/profile/delete-account').then(res => res.data);

export default api;
